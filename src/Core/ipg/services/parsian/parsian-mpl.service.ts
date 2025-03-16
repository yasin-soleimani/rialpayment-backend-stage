import { faildOpt, Inject, Injectable, NotFoundException, successOpt, successOptWithData } from '@vision/common';
import { IpgParsianService } from './parsian.service';
import * as UniqueNumber from 'unique-number';
import { AccountService } from '../../../useraccount/account/account.service';
import { LoggercoreService } from '../../../logger/loggercore.service';
import { MipgCoreService } from '../../../mipg/mipg.service';
import { imageTransform } from '@vision/common/transform/image.transform';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { IpgCoreService } from '../../ipgcore.service';

@Injectable()
export class IpgParsianMplCoreService {
  constructor(
    @Inject('IpgModel') private readonly ipgModel: any,
    @Inject('IpgMplModel') private readonly mplModel: any,
    private readonly ipgService: IpgCoreService,
    private readonly accountService: AccountService,
    private readonly loggerService: LoggercoreService,
    private readonly mipgService: MipgCoreService,
    private readonly parsianService: IpgParsianService
  ) {}

  async submitReq(
    userid: string,
    amount: number,
    terminalid: number,
    invoiceid: string,
    hash?: string,
    pkg?: string
  ): Promise<any> {
    const callback = 'https://core-backend.rialpayment.ir/v1/payment/sdk';

    const uniqueNumber = new UniqueNumber(true);
    const userinvoice = 'Mpl-' + uniqueNumber.generate();

    const terminalInfo = await this.mipgService.getInfoDirect(terminalid);
    if (!terminalInfo) throw new NotFoundException();

    const parsianInfo = this.getParsianTerminal(terminalInfo.direct);
    if (!parsianInfo) throw new NotFoundException();

    if (parsianInfo.sdk === false) throw new UserCustomException('SDK غیرفعال', false, 1015);

    const reqData = await this.parsianService.newReq(
      new Date().getTime(),
      amount,
      callback,
      'sdk',
      parsianInfo.loginaccount
    );

    return this.ipgSubmit(
      terminalid,
      userid,
      amount,
      callback,
      reqData.type,
      invoiceid,
      userinvoice,
      reqData.token,
      reqData.orderid,
      terminalInfo.karmozd,
      terminalInfo.paytype
    ).then((res) => {
      if (!res) return faildOpt();
      return { token: reqData.token, title: terminalInfo.title, logo: imageTransform(terminalInfo.logo) };
    });
  }

  async verify(token, orderid, terminalno, rrn, pan, status, terminalid): Promise<any> {
    const terminalInfo = await this.mipgService.getInfoDirect(terminalid);
    if (!terminalInfo) throw new NotFoundException();

    const parsianInfo = this.getParsianTerminal(terminalInfo.direct);
    if (!parsianInfo) throw new NotFoundException();
    if (Number(status) === 0) {
      const dataRes = await this.parsianService.checkout(token, parsianInfo.loginaccount);
      if (dataRes[0].ConfirmPaymentResult.Status === '0' && dataRes[0].ConfirmPaymentResult.Token > 0) {
        const data = await this.addSuccessParsian(
          token,
          dataRes[0].ConfirmPaymentResult.RRN,
          status,
          dataRes[0].ConfirmPaymentResult.CardNumberMasked
        );
        this.ipgModel
          .findOneAndUpdate({ terminalid: terminalid, invoiceid: data.invoiceid }, { status: 1 })
          .sort({ createdAt: -1 })
          .exec();
        const money = await this.ipgService.typeSelector(data.paytype, data.amount, data.karmozd);
        const verify = {
          status: true,
          total: money.total,
          discount: money.discount,
          amount: money.amount,
          trx: true,
        };
        await this.accountService.chargeAccount(data.user, 'wallet', data.amount);
        const title = 'شارژ کیف پول';
        await this.accountService.accountSetLoggWithRef(title, data.userinvoice, data.amount, true, null, data.user);
        await this.ipgModel.findOneAndUpdate({ token: token }, verify).exec();
        return {
          status: 0,
          success: true,
          message: 'عملیات با موفقیت انجام شد',
          cardno: dataRes[0].ConfirmPaymentResult.CardNumberMasked,
          invoiceid: data.invoiceid,
          rrn: rrn,
          ref: data.userinvoice,
          amount: money.total,
        };
      } else {
        const message = await this.parsianService.messageSelector(status);
        const data = await this.addFaildParsian(token, status, message);
        return {
          status: Number(status),
          success: false,
          message: message,
          amount: data.amount,
          ref: data.userinvoice,
        };
      }
    } else {
      const message = await this.parsianService.messageSelector(status);
      const data = await this.addFaildParsian(token, status, message);
      return {
        status: Number(status),
        success: false,
        message: message,
        amount: data.amount,
        ref: data.userinvoice,
      };
    }
  }

  private async ipgSubmit(
    terminalid,
    userid,
    amount,
    callbackurl,
    type,
    invoiceid,
    userinvoice,
    token,
    orderid,
    karmozd,
    paytype
  ): Promise<any> {
    return this.ipgModel.create({
      user: userid,
      amount: amount,
      callbackurl: callbackurl,
      type: type,
      terminalid: terminalid,
      invoiceid: invoiceid,
      userinvoice: userinvoice,
      paytype: paytype,
      karmozd: karmozd,
      devicetype: 'sdk',
      token: token,
      orderid: orderid,
      details: {
        respmsg: 'توکن ایجاد شد',
        respcode: -10000,
      },
    });
  }

  async getTransInfo(terminalid: number, invoiceid: string): Promise<any> {
    return this.ipgModel.findOne({ terminalid: terminalid, invoiceid: invoiceid }).sort({ createdAt: -1 });
  }

  async submitUserTrax(userid, amount, invoiceid, userinvoice, ref, details): Promise<any> {
    return this.ipgModel.create({
      user: userid,
      amount: amount,
      invoiceid: invoiceid,
      userinvoice: userinvoice,
      ref: ref,
      details: details,
    });
  }

  private async addSuccessParsian(token, rrn, status, maskedCardno): Promise<any> {
    return this.ipgModel
      .findOneAndUpdate(
        { token: token },
        {
          details: {
            rrn: rrn,
            cardnumber: maskedCardno,
            respmsg: 'عملیات با موفقیت انجام شد',
            respcode: status,
          },
        }
      )
      .populate('user')
      .exec();
  }

  private async addFaildParsian(token, status, message: string): Promise<any> {
    return this.ipgModel
      .findOneAndUpdate(
        { token: token },
        {
          details: {
            respcode: status || -6,
            respmsg: message,
          },
        }
      )
      .populate('user')
      .exec();
  }
  private getParsianTerminal(direct) {
    for (const info of direct) {
      if (info.psp == 2) return info;
    }
  }
}
