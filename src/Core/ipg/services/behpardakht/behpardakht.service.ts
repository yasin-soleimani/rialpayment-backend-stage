import { Inject, Injectable, InternalServerErrorException } from '@vision/common';
import * as soap from 'soap';
import * as momentjs from 'jalali-moment';
import { AccountService } from '../../../../Core/useraccount/account/account.service';
import { LoggercoreService } from '../../../../Core/logger/loggercore.service';
import { ClubPwaService } from '../../../clubpwa/club-pwa.service';

@Injectable()
export class IpgBehpardakhtService {
  private url = 'https://bpm.shaparak.ir/pgwchannel/services/pgw?wsdl';
  private options = {
    overrideRootElement: {
      namespace: 'ns1',
    },
  };
  constructor(
    @Inject('IpgModel') private readonly ipgModel: any,
    private readonly accountService: AccountService,
    private readonly loggerService: LoggercoreService,
    private readonly clubPwaService: ClubPwaService
  ) {}

  async newReq(amount, terminalid, username, password, orderid, callback): Promise<any> {
    const client = await soap.createClientAsync(this.url, this.options);
    const model = this.makeReqModel(amount, terminalid, username, password, orderid, callback);
    const data = await client.bpPayRequestAsync(model);
    const res = data[0].return.split(',');
    console.log(res, 'behpardakht get Token Result');
    if (res.length > 1) {
      //success true
      return this.success(res, orderid);
    } else {
      //failed
      throw new InternalServerErrorException();
    }
  }

  private success(result, orderid) {
    return {
      token: result[1],
      type: 5,
      orderid: orderid,
    };
  }

  async confirm(data): Promise<any> {
    const payInfo = await this.ipgModel.findOne({ token: data.RefId, trx: false });
    if (!payInfo) throw new InternalServerErrorException();
    await this.ipgModel.findOneAndUpdate({ token: data.RefId }, { $set: { trx: true } });

    const logInfo = await this.loggerService.findAndUpdate(payInfo.invoiceid, true);
    if (!logInfo || logInfo.status == true) throw new InternalServerErrorException();

    const referer = JSON.parse(payInfo.payload).referer;
    const clubPwaData = await this.clubPwaService.getClubPwaByReferer(referer);
    let clubPwaChargeCallback = clubPwaData ? clubPwaData.chargeCallback : '';

    if (data.ResCode == '0' && payInfo.orderid == data.SaleOrderId && payInfo.amount == data.FinalAmount) {
      return this.settlement(data, payInfo, clubPwaChargeCallback);
    } else {
      return this.confirmFailed(data, clubPwaChargeCallback);
    }
  }

  private async confirmSuccess(data, clubPwaCallback): Promise<any> {
    const success = await this.ipgModel.findOneAndUpdate(
      { token: data.RefId },
      {
        $set: {
          status: 1,
          details: {
            rrn: data.SaleReferenceId,
            digitalreceipt: data.CardHolderInfo,
            cardnumber: data.CardHolderPan,
            respmsg: 'عملیات با موفقیت انجام شد',
            respcode: data.ResCode,
          },
        },
      }
    );

    this.accountService.chargeAccount(success.user._id, 'wallet', success.amount);
    this.loggerService.findAndUpdate(success.invoiceid, true);
    return { info: success, status: 'ok' };
  }

  private async confirmFailed(data, clubPwaCallback: string): Promise<any> {
    const failed = await this.ipgModel.findOneAndUpdate(
      { token: data.RefId },
      {
        $set: {
          status: 0,
          details: {
            rrn: data.SaleReferenceId,
            digitalreceipt: data.CardHolderInfo,
            cardnumber: data.CardHolderPan,
            respmsg: 'عملیات با خطا مواجه شده است',
            respcode: data.ResCode,
          },
        },
      }
    );

    const details = {
      respmsg: 'عملیات با خطا مواجه شده است',
      respcode: data.ResCode,
      digitalreceipt: failed.details.digitalreceipt,
      cardnumber: failed.details.cardnumber,
      ref: failed.userinvoice,
    };
    return { info: failed, details: details, status: 'nok' };
  }

  private async settlement(data, payInfo, clubPwaCallback: string): Promise<any> {
    const client = await soap.createClientAsync(this.url, this.options);
    const model = this.verifyModel(payInfo, data);
    const verifyData = await client.bpVerifyRequestAsync(model);
    const verifyRes = verifyData[0].return;
    console.log(verifyRes, 'verifyRes');
    if (verifyRes == 0) {
      const settlData = await client.bpSettleRequestAsync(model);
      const settlRes = settlData[0].return;
      console.log(settlRes, 'settlRes');

      if (settlRes == 0) {
        return this.confirmSuccess(data, clubPwaCallback);
      } else {
        return this.confirmFailed(data, clubPwaCallback);
      }
    } else {
      return this.confirmFailed(data, clubPwaCallback);
    }
  }

  private verifyModel(payInfo, data) {
    return {
      terminalId: payInfo.terminalinfo.terminal,
      userName: payInfo.terminalinfo.username,
      userPassword: payInfo.terminalinfo.password,
      orderId: payInfo.orderid,
      saleOrderId: data.SaleOrderId,
      saleReferenceId: data.SaleReferenceId,
    };
  }

  private makeReqModel(amount, terminal, username, passowrd, orderid, callback) {
    return {
      terminalId: terminal,
      userName: username,
      userPassword: passowrd,
      orderId: orderid,
      amount: amount,
      callBackUrl: callback,
      localDate: momentjs().format('YYYYMMDD'),
      localTime: momentjs().format('HHmmss'),
      additionalData: '',
      payerId: 0,
    };
  }
}
