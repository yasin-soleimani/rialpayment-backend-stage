import { Injectable, Inject, InternalServerErrorException, NotFoundException } from '@vision/common';
import { IpgCoreDto } from './dto/ipgcore.dto';
import { DetailsCoreDto } from './dto/detailscore.dto';
import axios, { AxiosInstance } from 'axios';
import { AccountService } from '../useraccount/account/account.service';
import { LoggercoreService } from '../logger/loggercore.service';
import { discount, discountChangable } from '@vision/common/utils/load-package.util';
import { IpgParsianService } from './services/parsian/parsian.service';
import { IpgParsianDto } from '../../Api/charge/dto/parsian.details.dto';
import { IpgPersianService } from './services/persian/persian.service';
import { IpgReportService } from './services/report.class';
import { IPGTypes } from '@vision/common/constants/ipg.const';
import { IpgSamanService } from './services/saman/saman.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import * as SamanStates from './services/saman/saman.class';
import { MipgCoreService } from '../mipg/mipg.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { diffHourByIsoDate, todayRange } from '@vision/common/utils/month-diff.util';
import { Model } from 'mongoose';
import { IpgListCoreDto } from './dto/ipg-list.dto';
import { PardakhtNovinService } from './services/pna/pna.service';
import { ShaparakSettlementService } from '../shaparak/settlement/settlement.service';
import { MipgAuthService } from '../mipg/services/mipg-auth.service';
import { IpgCoreCheckPanService } from './services/common/check-pan.service';
import { IpgBehpardakhtService } from './services/behpardakht/behpardakht.service';
import { PardakhtNovinNewService, retunrData } from './services/pna/new-pna.service';

@Injectable()
export class IpgCoreService {
  private client: AxiosInstance;
  constructor(
    @Inject('IpgModel') private readonly ipgModel: any,
    @Inject('IpgListModel') private readonly ipgListModel: Model<any>,
    private readonly accountService: AccountService,
    private readonly loggerService: LoggercoreService,
    private readonly parsianService: IpgParsianService,
    private readonly persianService: IpgPersianService,
    private readonly ipgReportService: IpgReportService,
    private readonly settlementService: ShaparakSettlementService,
    private readonly mipgAuthService: MipgAuthService,
    private readonly samanService: IpgSamanService,
    private readonly checkPan: IpgCoreCheckPanService,
    private readonly pnaService: PardakhtNovinNewService,
    private readonly behpardakhtService: IpgBehpardakhtService,
    private readonly mipgService: MipgCoreService
  ) {}

  async newReqSubmit(ipgDto: IpgCoreDto): Promise<any> {
    const newlogger = new this.ipgModel(ipgDto);
    return newlogger.save();
  }
  async create(ipgDto: IpgCoreDto): Promise<any> {
    const res = await this.selector(ipgDto);
    const title = 'شارژ کیف پول از درگاه اینترنتی ';
    const log = this.setLogg(title, ipgDto.invoiceid, ipgDto.amount, false, ipgDto.user, ipgDto.user);
    await this.loggerService.newLogg(log);
    // ipgDto.token = res.token;
    // ipgDto.type = res.type;
    // ipgDto.orderid = res.orderid;1
    ipgDto.payload = ipgDto.cardno;
    ipgDto.type = 3;

    return await this.newReqSubmit(ipgDto);
  }

  async shopCharge(ipgDto, fullname, trasnid?): Promise<any> {
    const res = await this.selector(ipgDto, 'https://core-backend.rialpayment.ir/v1/vitrin/callback');
    const title =
      'انتقال وجه به ' + fullname + ' توسط ' + ipgDto.fullname + ' - ' + ipgDto.mobile + ' - ' + ipgDto.description;
    this.accountService.accountSetLoggWithRef(title, ipgDto.invoiceid, ipgDto.amount, false, trasnid, ipgDto.user);

    ipgDto.token = res.token;
    ipgDto.type = res.type;
    ipgDto.orderid = res.orderid;

    return this.newReqSubmit(ipgDto);
  }

  private async selector(ipgDto: IpgCoreDto, url?: string): Promise<any> {
    let callback = 'https://core-backend.rialpayment.ir/v1/payment/callback/parsian';
    if (!isEmpty(url)) {
      callback = url;
    }
    const merchantId = '3883859';
    const merchantConfigurationId = '4982';
    const username = 'TAKHFIF833930';
    const password = 'we4Q9iU7pY2';
    const key = 'jTyoDI6/x8lkmoYkzmCYyCf3HSndgN6CfawAVVOII98=';
    const iv = '7UWGP1c+hENowdKm3Q6F32Pp3Qh759AOkkLgI79dZrc=';
    return this.samanService.newReq();

    return this.parsianService.newReq(ipgDto.invoiceid, ipgDto.amount, callback, ipgDto.cardno, '5XV994G44XfiCc2Q0s5e');
    // return this.persianService.newReq( ipgDto.invoiceid, ipgDto.amount, callback , 'sadsad0', merchantConfigurationId, merchantId, username, password, key, iv);
  }

  private async selectorIPG(ipgDto: IpgCoreDto, code, terminalInfo: any, tmp?, callback?): Promise<any> {
    let callbackurl;

    switch (code.toString()) {
      case '1': {
        if (callback && callback == 'we have') {
          callbackurl = 'https://core-backend.sharjjet.ir/v1/payment/callback/persian';
        } else {
          callbackurl = 'https://service.sharjjet.ir/callback/persian/';
        }

        return this.persianService.newReqRest(
          ipgDto.invoiceid,
          ipgDto.amount,
          callbackurl,
          'sdas',
          terminalInfo.merchantconfigid,
          terminalInfo.merchant,
          terminalInfo.username,
          terminalInfo.password,
          terminalInfo.key,
          terminalInfo.iv
        );
      }

      case '2': {
        if (callback && callback == 'we have') {
          callbackurl = 'https://core-backend.sharjjet.ir/v1/payment/callback/parsian';
        } else {
          callbackurl = 'https://service.sharjjet.ir/callback/parsian';
        }

        return this.parsianService.newReq(
          ipgDto.invoiceid,
          ipgDto.amount,
          callbackurl,
          'sdas',
          terminalInfo.loginaccount
        );
      }

      case '3': {
        return this.samanService.newReq();
      }

      case '4': {
        if (callback && callback == 'we have') {
          callbackurl = 'https://core-backend.rialpayment.ir/v1/payment/callback/pna';
        } else {
          callbackurl = 'https://service.rialpayment.ir/callback/pna';
        }
        return this.pnaService.NewReq(callbackurl, ipgDto.amount, terminalInfo.username, terminalInfo.password);
      }

      case '5': {
        if (callback) {
          callbackurl = 'https://core-backend.rialpayment.ir/v1/payment/callback/behpardakht';
        } else {
          callbackurl = 'https://service.rialpayment.ir/callback/behpardakht';
        }
        return this.behpardakhtService.newReq(
          ipgDto.amount,
          terminalInfo.terminal,
          terminalInfo.username,
          terminalInfo.password,
          new Date().getTime(),
          callbackurl
        );
      }
    }
  }

  async addDetails(detailsDto: DetailsCoreDto): Promise<any> {
    const details = await this.ipgModel
      .findOneAndUpdate({ invoiceid: detailsDto.invoiceid }, { details: detailsDto })
      .populate('user')
      .exec();
    const State = await this.checkOut(detailsDto.digitalreceipt, detailsDto.terminalid);
    const title = 'شارژ کیف پول از درگاه اینترنتی ';
    if (State.Status == 'Ok') {
      this.ipgModel.findOneAndUpdate({ invoiceid: detailsDto.invoiceid }, { status: 1 }).exec();
      this.accountService.chargeAccount(details.user._id, 'wallet', details.amount);
      this.loggerService.findAndUpdate(detailsDto.invoiceid, true);
      return { info: details, status: 'ok' };
    } else {
      this.ipgModel.findOneAndUpdate({ invoiceid: detailsDto.invoiceid }, { status: State.ReturnId }).exec();
      return { info: details, status: 'nok' };
    }
  }

  async addAuthInfo(userinvoice: any, query: any): Promise<any> {
    return this.ipgModel.findOneAndUpdate({ userinvoice: userinvoice }, query);
  }
  async addQuery(id: any, query: any): Promise<any> {
    return this.ipgModel.findOneAndUpdate({ _id: id }, query);
  }

  async addDetailsBehpardakht(getInfo: any): Promise<any> {
    return this.behpardakhtService.confirm(getInfo);
  }

  async addDetailsPna(getInfo): Promise<any> {
    return this.pnaService.confirmTransaction(getInfo);
  }

  async addDetailsParsian(getInfo: IpgParsianDto): Promise<any> {
    const traxInfo = await this.ipgModel.findOne({ token: getInfo.Token });
    if (getInfo.status == 0) {
      const dataRes = await this.parsianService.checkout(getInfo.Token, traxInfo.terminalinfo.loginaccount);
      if (dataRes[0].ConfirmPaymentResult.Status == 0 && dataRes[0].ConfirmPaymentResult.Token > 0) {
        const data = await this.addSuccessParsian(getInfo, dataRes[0].ConfirmPaymentResult.CardNumberMasked);

        await this.checkPan.validation(traxInfo, dataRes[0].ConfirmPaymentResult.CardNumberMasked);
        this.accountService.chargeAccount(data.user._id, 'wallet', data.amount);
        this.loggerService.findAndUpdate(data.invoiceid, true);
        return { info: data, status: 'ok' };
      } else {
        const message = await this.parsianService.messageSelector(getInfo.status);
        const data = await this.addFaildParsian(getInfo, message);
        return { info: data, status: 'nok' };
      }
    } else {
      const message = await this.parsianService.messageSelector(getInfo.status);
      const data = await this.addFaildParsian(getInfo, message);
      return { info: data, status: 'nok' };
    }
  }

  private async addSuccessParsian(getInfo: IpgParsianDto, maskedCardno): Promise<any> {
    return this.ipgModel
      .findOneAndUpdate(
        { token: getInfo.Token },
        {
          details: {
            rrn: getInfo.RRN,
            cardnumber: maskedCardno,
            respmsg: 'عملیات با موفقیت انجام شد',
            respcode: getInfo.status,
          },
        }
      )
      .populate('user')
      .exec();
  }

  private async addFaildParsian(getInfo, message: string): Promise<any> {
    return this.ipgModel
      .findOneAndUpdate(
        { token: getInfo.Token },
        {
          details: {
            respcode: getInfo.status || -6,
            respmsg: message,
          },
        }
      )
      .populate('user')
      .exec();
  }

  async addSuccessPersian(getInfo): Promise<any> {
    const merchantId = '3883859';
    const merchantConfigurationId = '4982';
    const username = 'TAKHFIF833930';
    const password = 'we4Q9iU7pY2';
    const key = 'jTyoDI6/x8lkmoYkzmCYyCf3HSndgN6CfawAVVOII98=';
    const iv = '7UWGP1c+hENowdKm3Q6F32Pp3Qh759AOkkLgI79dZrc=';
    const res = await this.persianService.checkout(getInfo, merchantConfigurationId, key, iv);
    const data = await this.ipgModel.findOneAndUpdate({ token: res.token }, { details: res });
    if (res.respcode == '0') {
      this.ipgModel.findOneAndUpdate({ invoiceid: data.invoiceid }, { status: 1 }).exec();
      this.accountService.chargeAccount(data.user, 'wallet', data.amount);
      await this.settlementService.submit(100, data.amount, 1, 0, data.amount, data._id, '', '', '');
      this.loggerService.findAndUpdate(data.invoiceid, true);
      return { info: data, status: 'ok' };
    } else {
      this.ipgModel.findOneAndUpdate({ token: res.token }, { details: res }).exec();
      return { info: data, status: 'nok' };
    }
  }

  async addSuccessPersianNew(getInfo): Promise<any> {
    console.log('data from callback asan::::::', getInfo);
    const traxInfo = await this.ipgModel.findOne({ orderid: getInfo.tr, trx: false });
    if (!traxInfo) throw new NotFoundException('تراکنش یافت نشد');
    const clubPwaCallback = await this.persianService.getClubPwa(traxInfo);
    const res = await this.persianService.confirm(getInfo, traxInfo);
    if (res.data) {
      const data = {
        cardnumber: res.data.cardNumber,
        rrn: res.data.rrn,
        refID: res.data.refID,
        amount: res.data.amount,
        payGateTranID: res.data.payGateTranID,
        salesOrderID: res.data.salesOrderID,
        serviceTypeId: res.data.serviceTypeId,
        respmsg: 'عملیات با موفقیت انجام شد',
        respcode: 0,
      };
      const verfiyRes = await this.persianService.verify(traxInfo, res.data.payGateTranID);
      if (verfiyRes.status === 200) {
        const lastData = await this.ipgModel.findOneAndUpdate(
          { _id: traxInfo._id },
          {
            details: { ...data },
            status: 1,
            trx: true,
            confirm: true,
          }
        );
        console.log('traxInfo::::::::::::::', traxInfo);
        this.accountService.chargeAccount(traxInfo.user, 'wallet', traxInfo.amount);
        this.loggerService.findAndUpdate(traxInfo.invoiceid, true);
        this.persianService.settlement(traxInfo, res.data.payGateTranID);
        return { info: lastData, status: 'ok', clubPwaCallback };
      } else {
        return { info: traxInfo, status: 'nok', clubPwaCallback };
      }
    } else {
      const newData = await this.ipgModel
        .findOneAndUpdate(
          { _id: traxInfo._id },
          {
            details: {
              ...traxInfo.details,
              respmsg: 'تراکنش توسط کاربر لغو و یا زمان آن به پایان رسیده',
              rrn: null,
              cardnumber: null,
              respcode: res.status,
            },
          }
        )
        .exec();
      return { info: traxInfo, status: 'nok', clubPwaCallback };
    }
    /* const res = await this.persianService.checkout(getInfo, merchantConfigurationId, key, iv);
     const data = await this.ipgModel.findOneAndUpdate({ token: res.token }, { details: res });
    if (res.respcode == '0') {
      this.ipgModel.findOneAndUpdate({ invoiceid: data.invoiceid }, { status: 1 }).exec();
      this.accountService.chargeAccount(data.user, 'wallet', data.amount);
      await this.settlementService.submit(100, data.amount, 1, 0, data.amount, data._id, '', '', '');
      this.loggerService.findAndUpdate(data.invoiceid, true);
      return { info: data, status: 'ok' };
    } else {
      this.ipgModel.findOneAndUpdate({ token: res.token }, { details: res }).exec();
      return { info: data, status: 'nok' };
    }*/
  }

  async addDetailsSaman(getInfo): Promise<any> {
    let state = SamanStates[getInfo.State];
    if (!state) {
      state = {
        code: -10,
        cause: 'عملیات با خطا مواجه شده است',
      };
    }
    if (getInfo.State == 'OK' && getInfo.StateCode == 0 && !isEmpty(getInfo.RefNum)) {
      const data = await this.samanService.checkout(getInfo);
      if (data[0].result.$value > 0) {
        const success = await this.ipgModel
          .findOneAndUpdate(
            { $or: [{ invoiceid: getInfo.ResNum }, { ref: getInfo.ResNum }] },
            {
              details: {
                rrn: getInfo.RRN,
                cardnumber: getInfo.SecurePan,
                respmsg: state.cause,
                respcode: state.code,
              },
            }
          )
          .populate('user');
        this.ipgModel
          .findOneAndUpdate({ $or: [{ invoiceid: getInfo.ResNum }, { ref: getInfo.ResNum }] }, { status: 1 })
          .exec();
        this.accountService.chargeAccount(success.user._id, 'wallet', success.amount);
        this.loggerService.findAndUpdate(success.invoiceid, true);
        return { info: success, status: 'ok' };
      } else {
        const faild = await this.ipgModel
          .findOneAndUpdate(
            { $or: [{ invoiceid: getInfo.ResNum }, { ref: getInfo.ResNum }] },
            {
              details: {
                rrn: getInfo.RRN,
                cardnumber: getInfo.SecurePan,
                respmsg: state.cause,
                respcode: state.code,
              },
            }
          )
          .populate('user');

        return { info: faild, status: 'nok' };
      }
    } else {
      const faild = await this.ipgModel
        .findOneAndUpdate(
          { $or: [{ invoiceid: getInfo.ResNum }, { ref: getInfo.ResNum }] },
          {
            details: {
              rrn: getInfo.RRN,
              cardnumber: getInfo.SecurePan,
              respmsg: state.cause,
              respcode: state.code,
            },
          }
        )
        .populate('user');
      const details = {
        respmsg: state.cause || 'عملیات با خطا مواجه شده است',
        respcode: state.code || -10,
        digitalreceipt: faild.details.digitalreceipt,
        cardnumber: faild.details.cardnumber,
        ref: faild.userinvoice,
      };
      return { info: faild, details: details, status: 'nok' };
    }
  }

  private addDetailsPersian(getInfo): Promise<any> {
    return this.ipgModel.findOneAndUpdate({ token: getInfo.token }, getInfo);
  }

  async verify(terminalid: number, ref: string): Promise<any> {
    const data = await this.ipgModel.findOne({
      terminalid: terminalid,
      userinvoice: ref,
    });
    if (!data)
      return {
        status: -1,
        success: false,
        message: 'تراکنش یافت نشد',
      };

    if (data.trx == true)
      return {
        status: -2,
        success: false,
        message: 'تراکنش تکراری می باشد',
      };
    const diff = diffHourByIsoDate(data.createdAt);
    if (diff < 72 && diff > -5) {
      if (data.details.respcode == 0 && data.details.rrn > 0) {
        const datax = await this.ipgModel
          .findOneAndUpdate(
            {
              terminalid: terminalid,
              userinvoice: ref,
            },
            { trx: true }
          )
          .then(async (res) => {
            if (!res) throw new InternalServerErrorException();

            const terminalInfo = await this.mipgService.getInfo(terminalid);
            if (!terminalInfo) throw new UserCustomException('ترمینال یافت نشد', false, -10);
            if (data.retry < 2) {
              await this.calcWage(data, terminalInfo);
            }
            return res;
          });
        return {
          status: datax.details.respcode,
          success: true,
          message: datax.details.respmsg,
          rrn: datax.details.rrn,
          cardnumber: datax.details.cardnumber,
        };
      } else {
        const data = await this.ipgModel.findOneAndUpdate(
          {
            terminalid: terminalid,
            userinvoice: ref,
          },
          { trx: true }
        );
        return {
          status: data.details.respcode,
          success: false,
          message: data.details.respmsg,
          rrn: data.details.rrn,
          cardnumber: data.details.cardnumber,
        };
      }
    } else {
      return {
        status: -9,
        success: false,
        message: 'زمان تایید تراکنش به پایان رسیده است',
      };
    }
  }

  async addDetailsGuest(getInfo): Promise<any> {
    let state = SamanStates[getInfo.State];
    if (!state) {
      state = {
        code: -10,
        cause: 'عملیات با خطا مواجه شده است',
      };
    }
    if (getInfo.State == 'OK' && getInfo.StateCode == 0 && !isEmpty(getInfo.RefNum)) {
      const data = await this.samanService.checkout(getInfo);
      if (data[0].result.$value > 0) {
        const success = await this.ipgModel
          .findOneAndUpdate(
            { invoiceid: getInfo.ResNum },
            {
              details: {
                rrn: getInfo.RRN,
                cardnumber: getInfo.SecurePan,
                respmsg: state.cause,
                respcode: state.code,
              },
            }
          )
          .populate('user');
        this.ipgModel.findOneAndUpdate({ invoiceid: getInfo.ResNum }, { status: 1 }).exec();
        // this.accountService.chargeAccount(success.user._id, 'wallet', success.amount);
        // this.loggerService.findAndUpdate(success.invoiceid, true);
        return { info: success, status: 'ok' };
      } else {
        const faild = await this.ipgModel
          .findOneAndUpdate(
            { invoiceid: getInfo.ResNum },
            {
              details: {
                rrn: getInfo.RRN,
                cardnumber: getInfo.SecurePan,
                respmsg: state.cause,
                respcode: state.code,
              },
            }
          )
          .populate('user');

        return { info: faild, status: 'nok' };
      }
    } else {
      const faild = await this.ipgModel
        .findOneAndUpdate(
          { invoiceid: getInfo.ResNum },
          {
            details: {
              rrn: getInfo.RRN,
              cardnumber: getInfo.SecurePan,
              respmsg: state.cause,
              respcode: state.code,
            },
          }
        )
        .populate('user');
      const details = {
        respmsg: state.cause || 'عملیات با خطا مواجه شده است',
        respcode: state.code || -10,
        digitalreceipt: faild.details.digitalreceipt,
        cardnumber: faild.details.cardnumber,
        ref: faild.userinvoice,
      };
      return { info: faild, details: details, status: 'nok' };
    }

    // const details = await this.ipgModel.findOneAndUpdate({invoiceid: detailsDto.invoiceid}, { details: detailsDto}).populate('user').exec();
    // const State = await this.checkOut(detailsDto.digitalreceipt, detailsDto.terminalid);
    // if (State.Status == 'Ok') {
    //   this.ipgModel.findOneAndUpdate({invoiceid: detailsDto.invoiceid}, { status: 1}).exec();
    //   this.loggerService.findAndUpdate(detailsDto.invoiceid, true);
    //   return {info : details, status: 'ok'};
    // } else {
    //   this.ipgModel.findOneAndUpdate({invoiceid: detailsDto.invoiceid}, { status: State.ReturnId}).exec();
    //   return {info : details, status: 'nok'};
    // }
  }

  async ipgaddDetails(detailsDto: DetailsCoreDto): Promise<any> {
    const State = await this.checkOut(detailsDto.digitalreceipt, detailsDto.terminalid);
    if (State.Status == 'Ok') {
      const money = discount(detailsDto.amount);
      detailsDto.total = detailsDto.amount;
      detailsDto.discount = money.discount;
      detailsDto.amount = money.amount;
      const details = await this.ipgModel
        .findOneAndUpdate({ userinvoice: detailsDto.invoiceid }, { details: detailsDto, status: 1 })
        .exec();
      await this.accountService.chargeAccount(details.user._id, 'wallet', money.amount);
      this.loggerService.findAndUpdateIPG(detailsDto.invoiceid, true, money.amount);
      return { info: details, details: detailsDto, status: 'ok' };
    } else {
      const details = await this.ipgModel
        .findOneAndUpdate({ userinvoice: detailsDto.invoiceid }, { details: detailsDto, status: State.ReturnId })
        .exec();
      return { info: details, details: detailsDto, status: 'nok' };
    }
  }

  async ipgAddDetailsParsian(getInfo): Promise<any> {
    const traxInfo = await this.ipgModel.findOne({ token: getInfo.Token });
    if (!traxInfo) throw new UserCustomException('تراکنش یافت نشد ');
    if (getInfo.status == 0) {
      const dataRes = await this.parsianService.checkout(getInfo.Token, traxInfo.terminalinfo.loginaccount);

      if (dataRes[0].ConfirmPaymentResult.Status == 0 && dataRes[0].ConfirmPaymentResult.Token > 0) {
        const data = await this.addSuccessParsian(getInfo, dataRes[0].ConfirmPaymentResult.CardNumberMasked);

        const money = await this.typeSelector(data.paytype, data.amount, data.karmozd);
        const verify = {
          status: true,
          total: money.total,
          discount: money.discount,
          amount: money.amount,
        };
        await this.ipgModel.findOneAndUpdate({ token: getInfo.Token }, verify).exec();

        const details = {
          respcode: dataRes[0].ConfirmPaymentResult.Status,
          respmsg: 'عملیات با موفقیت انجام شد',
          digitalreceipt: dataRes[0].ConfirmPaymentResult.RRN,
          cardnumber: dataRes[0].ConfirmPaymentResult.CardNumberMasked,
          ref: data.userinvoice,
        };
        const info = await this.ipgModel.findOne({ token: getInfo.Token });
        const terminalInfo = await this.mipgService.getInfo(info.terminalid);

        await this.calcWage(info, terminalInfo);
        if (info.isdirect == true) {
          await this.dechargeWallet(info, terminalInfo);
        }
        if (info.pardakhtyari == true) {
          await this.settlementService.submit(
            info.terminalid,
            money.amount,
            1,
            money.discount,
            money.total,
            info._id,
            info.terminalinfo.acceptorcode,
            info.terminalinfo.terminal,
            info.terminalinfo.sheba
          );
        }
        return { info: info, details: details, status: 'ok' };
      } else {
        const message = await this.parsianService.messageSelector(getInfo.status);
        const data = await this.addFaildParsian(getInfo, message);
        const details = {
          respcode: dataRes[0].ConfirmPaymentResult.Status,
          respmsg: await this.parsianService.messageSelector(getInfo.status),
          digitalreceipt: dataRes[0].ConfirmPaymentResult.RRN,
          cardnumber: dataRes[0].ConfirmPaymentResult.CardNumberMasked,
          ref: data.userinvoice,
        };
        const info = await this.ipgModel.findOne({ token: getInfo.Token });
        return { info: info, details: details, status: 'nok' };
      }
    } else {
      const message = await this.parsianService.messageSelector(getInfo.status);
      await this.addFaildParsian(getInfo, message);
      const details = {
        respcode: -1,
        respmsg: 'عملیات با خطا مواجه شده است',
      };
      const info = await this.ipgModel.findOne({ token: getInfo.Token });
      return { info: info, details: details, status: 'nok' };
    }
  }

  async ipgAddDetailsPersian(getInfo, tmp): Promise<any> {
    console.log('data from asan pardakht:::: ', getInfo);
    const traxInfo = await this.ipgModel.findOne({ orderid: tmp });
    if (!traxInfo) throw new UserCustomException('تراکنش یافت نشد ');

    const res = await this.persianService.confirm(getInfo, traxInfo);
    console.log('Res confirm::::::::::::::::::::::: ', res);
    if (res.data) {
      const data = {
        cardnumber: res.data?.cardNumber,
        rrn: res.data?.rrn,
        refID: res.data?.refID,
        datepaid: new Date(),
        issuerbank: res?.data?.issuerbank ?? '',
        amount: res.data.amount,
        payGateTranID: res.data.payGateTranID,
        salesOrderID: res.data.salesOrderID,
        serviceTypeId: res.data.serviceTypeId,
        respmsg: 'عملیات با موفقیت انجام شد',
        respcode: 0,
      };
      const verfiyRes = await this.persianService.verify(traxInfo, res.data.payGateTranID);
      if (verfiyRes.status === 200) {
        const lastData = await this.ipgModel.findOneAndUpdate(
          { _id: traxInfo._id },
          {
            details: { ...data },
            status: 1,
            confirm: true,
          }
        );
        console.log('traxInfo::::::::::::::', traxInfo);
        const money = await this.typeSelector(traxInfo.paytype, data.amount, traxInfo.karmozd);
        const verify = {
          status: true,
          total: money.total,
          discount: money.discount,
          amount: money.amount,
        };
        await this.ipgModel.findOneAndUpdate({ token: traxInfo.token }, verify).exec();
        const info = await this.ipgModel.findOne({ token: traxInfo.token });
        if (info.pardakhtyari == true) {
          await this.settlementService.submit(
            info.terminalid,
            money.amount,
            2,
            money.discount,
            money.total,
            info._id,
            info.terminalinfo.acceptorcode,
            info.terminalinfo.terminal,
            info.terminalinfo.sheba
          );
        }
        /*        this.accountService.chargeAccount(traxInfo.user, 'wallet', traxInfo.amount);
        this.loggerService.findAndUpdate(traxInfo.invoiceid, true);*/
        this.persianService.settlement(traxInfo, res.data.payGateTranID);
        return { info: lastData, status: 'ok', details: data };
      } else {
        return { info: traxInfo, status: 'nok', details: data };
      }
    } else {
      const details = {
        ...traxInfo.details,
        respmsg: 'تراکنش توسط کاربر لغو و یا زمان آن به پایان رسیده',
        rrn: null,
        cardnumber: null,
        respcode: res.status,
        amount: traxInfo.amount,
      };
      const newData = await this.ipgModel
        .findOneAndUpdate(
          { _id: traxInfo._id },
          {
            details: details,
          }
        )
        .exec();
      return {
        info: traxInfo,
        details: details,
        status: 'nok',
      };
    }

    /*const res = await this.persianService.checkout(
      getInfo,
      traxInfo.terminalinfo.merchantconfigid,
      traxInfo.terminalinfo.key,
      traxInfo.terminalinfo.iv
    );

    const data = await this.ipgModel.findOneAndUpdate({ token: res.token }, { details: res });
    if (res.respcode == '0') {
      const money = await this.typeSelector(data.paytype, data.amount, data.karmozd);
      const verify = {
        status: true,
        total: money.total,
        discount: money.discount,
        amount: money.amount,
      };
      await this.ipgModel.findOneAndUpdate({ token: res.token }, verify).exec();
      const info = await this.ipgModel.findOne({ token: res.token });
      if (info.pardakhtyari == true) {
        await this.settlementService.submit(
          info.terminalid,
          money.amount,
          2,
          money.discount,
          money.total,
          info._id,
          info.terminalinfo.acceptorcode,
          info.terminalinfo.terminal,
          info.terminalinfo.sheba
        );
      }
      return { info: info, details: res, status: 'ok' };
    } else {
      const info = await this.ipgModel.findOne({ token: res.token });
      return { info: info, details: res, status: 'nok' };
    }*/
  }

  async ipgAddDetailsSaman(getInfo): Promise<any> {
    let state = SamanStates[getInfo.State];
    if (!state) {
      state = {
        code: -10,
        cause: 'عملیات با خطا مواجه شده است',
      };
    }
    if (getInfo.State == 'OK' && getInfo.StateCode == 0 && !isEmpty(getInfo.RefNum)) {
      const data = await this.samanService.checkout(getInfo);
      if (data[0].result.$value > 0) {
        const success = await this.addsuccessSaman(getInfo, state);
        const money = await this.typeSelector(success.paytype, success.amount, success.karmozd);
        const verify = {
          status: true,
          total: money.total,
          discount: money.discount,
          amount: money.amount,
        };
        const datax = await this.ipgModel.findOneAndUpdate({ userinvoice: getInfo.ResNum }, verify).exec();
        const details = {
          respmsg: state.cause,
          respcode: state.code,
          digitalreceipt: getInfo.RRN,
          cardnumber: getInfo.SecurePan,
          ref: data.userinvoice,
        };

        const info = await this.ipgModel.findOne({ userinvoice: getInfo.ResNum });
        const terminalInfo = await this.mipgService.getInfo(info.terminalid);

        await this.calcWage(info, terminalInfo);

        if (info.pardakhtyari == true) {
          await this.settlementService.submit(
            info.terminalid,
            money.amount,
            3,
            money.discount,
            money.total,
            info._id,
            info.terminalinfo.acceptorcode,
            info.terminalinfo.terminal,
            info.terminalinfo.sheba
          );
        }
        if (info.isdirect == true) {
          await this.dechargeWallet(info, terminalInfo);
        }
        return { info: info, details: details, status: 'ok' };
      } else {
        const faild = await this.addfaildSaman(getInfo, state);
        const details = {
          respmsg: state.cause || 'عملیات با خطا مواجه شده است',
          respcode: state.code || -10,
          digitalreceipt: faild.details.digitalreceipt,
          cardnumber: faild.details.cardnumber,
          ref: faild.userinvoice,
        };
        return { info: faild, details: details, status: 'nok' };
      }
    } else {
      const faild = await this.addfaildSaman(getInfo, state);
      const details = {
        respmsg: state.cause || 'عملیات با خطا مواجه شده است',
        respcode: state.code || -10,
        digitalreceipt: faild.details.digitalreceipt,
        cardnumber: faild.details.cardnumber,
        ref: faild.userinvoice,
      };
      return { info: faild, details: details, status: 'nok' };
    }
  }

  async ipgAddDetailsPna(getInfo: retunrData): Promise<any> {
    console.log('in mipg gway :::::::::', getInfo);
    return this.pnaService.confirmTransaction(getInfo);
    let state = SamanStates[getInfo.status];
    if (!state) {
      state = {
        code: -10,
        cause: 'عملیات با خطا مواجه شده است',
      };
    }
    const traxInfo = await this.ipgModel.findOne({ token: getInfo.Token });
    if (getInfo.status == '0' && getInfo.Token) {
      const data = await this.pnaService.verifyTrax(
        getInfo,
        traxInfo.terminalinfo.username,
        traxInfo.terminalinfo.password
      );
      if (data.status == 0) {
        const maskCard = this.pnaService.fixPan(getInfo);
        const success = await this.addDetailsAddSuccess(
          getInfo.Token,
          0,
          'عملیات با موفقیت انجام شد',
          data.cardNumberMasked,
          getInfo.OrderId
        );
        const money = await this.typeSelector(success.paytype, traxInfo.amount, success.karmozd);
        const verify = {
          status: true,
          total: money.total,
          discount: money.discount,
          amount: money.amount,
        };
        const datax = await this.ipgModel.findOneAndUpdate({ token: getInfo.Token }, verify).exec();
        const details = {
          respmsg: state.cause,
          respcode: state.code,
          digitalreceipt: getInfo.RRN,
          cardnumber: data.cardNumberMasked,
          ref: getInfo.OrderId,
        };

        const info = await this.ipgModel.findOne({ token: getInfo.Token });
        console.log('callback info ipg callback', info.callbackurl);
        return { info: info, details: details, status: 'ok' };
      } else {
        const faild = await this.addDetailsAddSuccess(getInfo.Token, state.code, state.cause, '', '');
        const details = {
          respmsg: state.cause || 'عملیات با خطا مواجه شده است',
          respcode: state.code || -10,
          digitalreceipt: faild.details.digitalreceipt,
          cardnumber: faild.details.cardnumber,
          ref: faild.userinvoice,
        };
        return { info: faild, details: details, status: 'nok' };
      }
    } else {
      const faild = await this.addDetailsAddSuccess(getInfo.Token, state.code, state.cause, '', '');
      const details = {
        respmsg: state.cause || 'عملیات با خطا مواجه شده است',
        respcode: state.code || -10,
        digitalreceipt: faild.details.digitalreceipt,
        cardnumber: faild.details.cardnumber,
        ref: faild.userinvoice,
      };
      return { info: faild, details: details, status: 'nok' };
    }
  }

  private async addsuccessSaman(getInfo, state): Promise<any> {
    return this.ipgModel.findOneAndUpdate(
      { userinvoice: getInfo.ResNum },
      {
        details: {
          rrn: getInfo.RRN,
          cardnumber: getInfo.SecurePan,
          respmsg: state.cause,
          respcode: state.code,
        },
      }
    );
  }

  private async addfaildSaman(getInfo, state): Promise<any> {
    return this.ipgModel
      .findOneAndUpdate(
        { userinvoice: getInfo.ResNum },
        {
          details: {
            respcode: state.code || -6,
            respmsg: state.cause || 'عملیات تکمیل نشده است',
          },
        }
      )
      .populate('user')
      .exec();
  }

  private setLogg(titlex, refx, amountx, statusx, fromid, toid) {
    return {
      title: titlex,
      ref: refx,
      amount: amountx,
      status: statusx,
      from: fromid,
      to: toid,
    };
  }

  async findByRef(refx: string): Promise<any> {
    return await this.ipgModel.findOne({ ref: refx });
  }
  async findByInvoiceid(invoiceidx: string): Promise<any> {
    return await this.ipgModel.findOne({ invoiceid: invoiceidx });
  }

  async findByUserInvoice(invoiceidx: string): Promise<any> {
    return await this.ipgModel.findOne({ userinvoice: invoiceidx });
  }

  async findByUserInvoiceAndUpdate(invoiceid: string): Promise<any> {
    return this.ipgModel.findOneAndUpdate(
      { userinvoice: invoiceid, launch: false },
      {
        launch: true,
      }
    );
  }

  async findByUserInvoiceAndUser(userinvoiceid: string, user: string): Promise<any> {
    return this.ipgModel.findOne({
      userinvoice: userinvoiceid,
      user: user,
    });
  }

  async findByUserInvoiceAndUPdateIPG(invoiceidx: string): Promise<any> {
    return await this.ipgModel
      .findOneAndUpdate(
        { userinvoice: invoiceidx },
        {
          details: {
            respmsg: 'کاربر به درگاه هدایت شد',
          },
        }
      )
      .populate('user')
      .exec();
  }

  async launchTrue(userinvoice: string): Promise<any> {
    return this.ipgModel.findOneAndUpdate(
      {
        userinvoice: userinvoice,
      },
      { launch: true }
    );
  }

  async chargeLaunchTrue(ref: string): Promise<any> {
    return this.ipgModel.findOneAndUpdate(
      {
        ref: ref,
      },
      { launch: true }
    );
  }

  async getTraxInfo(terminalid, invoiceid): Promise<any> {
    return this.ipgModel.findOne({
      terminalid: terminalid,
      userinvoice: invoiceid,
    });
  }

  async getTraxInfoBO(terminalid, invoiceid): Promise<any> {
    let query;
    if (terminalid && terminalid != 'undefined') {
      query = {
        $and: [
          { terminalid: terminalid },
          {
            $or: [{ userinvoice: invoiceid }, { invoiceid: invoiceid }],
          },
        ],
      };
    } else {
      query = {
        $or: [{ userinvoice: invoiceid }, { invoiceid: invoiceid }],
      };
    }
    return this.ipgModel.findOne(query);
  }

  async getTraxInfoByInvoiceid(invoiceid): Promise<any> {
    return this.ipgModel.findOne({
      userinvoice: invoiceid,
    });
  }

  async setConfirm(id: string): Promise<any> {
    return this.ipgModel.findOneAndUpdate(
      { _id: id },
      {
        confirm: true,
        trx: true,
      }
    );
  }

  async makeItTrue(userinvoice): Promise<any> {
    return this.ipgModel.findOneAndUpdate(
      {
        userinvoice: userinvoice,
      },
      { confirm: true }
    );
  }
  async getTraxInfoByRefNum(invoiceid): Promise<any> {
    return this.ipgModel.findOne({
      details: {
        refnum: invoiceid,
      },
    });
  }

  async confirmParsian(token, cardno, rrn, respcode, msg): Promise<any> {
    return this.ipgModel.findOneAndUpdate(
      {
        token: token,
      },
      {
        confirm: true,
        details: {
          cardnumber: cardno,
          rrn: rrn,
          respcode: respcode,
          respmsg: msg,
        },
      }
    );
  }

  async confirmTrax(terminalid, invoiceid): Promise<any> {
    return this.ipgModel.findOneAndUpdate(
      {
        terminalid: terminalid,
        invoiceid: invoiceid,
      },
      {
        confirm: true,
      }
    );
  }

  async globalConfirm(terminalid, invoiceid): Promise<any> {
    return this.ipgModel.findOneAndUpdate(
      {
        terminalid: terminalid,
        userinvoice: invoiceid,
      },
      {
        confirm: true,
        trx: true,
      }
    );
  }

  async reverseTrax(terminalid, invoice): Promise<any> {
    return this.ipgModel.findOneAndUpdate(
      {
        terminalid: terminalid,
        invoiceid: invoice,
      },
      {
        reverse: true,
      }
    );
  }

  async submitCallbackDetails(invoiceid, respcode, respmsg, cardno, rrn, refnum): Promise<any> {
    return this.ipgModel.findOneAndUpdate(
      {
        userinvoice: invoiceid,
      },
      {
        details: {
          rrn: rrn,
          respcode: respcode,
          respmsg: respmsg,
          cardnumber: cardno,
          refnum: refnum,
        },
      }
    );
  }

  async getTraxInfoByToken(token): Promise<any> {
    return this.ipgModel.findOne({
      token: token,
    });
  }

  async newReqDetails(
    terminalid,
    invoiceid,
    amount,
    psp,
    karmozd,
    karmozdtype,
    callbackurl,
    user,
    respmsg,
    userinvoice,
    token,
    wagetype
  ): Promise<any> {
    const money = await this.typeSelector(Number(karmozdtype), Number(amount), Number(karmozd));
    return this.ipgModel.create({
      user: user,
      terminalid: terminalid,
      trx: true,
      direct: true,
      launch: true,
      status: true,
      total: money.total,
      discount: money.discount,
      amount: money.amount,
      invoiceid: invoiceid,
      userinvoice: userinvoice,
      callbackurl: callbackurl,
      karmozd: karmozd,
      paytype: karmozdtype,
      type: psp,
      token: token,
      wagetype: wagetype,
      details: {
        respcode: -10000,
        respmsg: respmsg,
      },
    });
  }

  async newReq(ipgDto: IpgCoreDto, callback?): Promise<any> {
    let terminalInfo;
    let terminalShare;
    let directTerminal;
    if (ipgDto.isdirect == true) {
      terminalInfo = await this.mipgService.getInfo(ipgDto.terminalid);
      if (!terminalInfo) throw new NotFoundException();
      directTerminal = terminalInfo;
    } else {
      terminalInfo = await this.mipgService.getInfo(ipgDto.terminalid);
      if (!terminalInfo) throw new NotFoundException();
      terminalShare = await this.mipgService.getInfo(101);
      if (!terminalShare) throw new NotFoundException();
      directTerminal = terminalShare;
    }

    let authStatus = false;
    const authInfo = await this.mipgAuthService.getInfoByMipg(terminalInfo._id);
    if (authInfo) {
      authStatus = authInfo.status;
    }

    // return terminalInfo;

    // let code;
    // if ( isEmpty(terminalInfo.psp) || terminalInfo.psp == ['0'] ) {
    //    const dataPsp = await this.ipgListModel.find({ status: true });
    //    const pspCounts = dataPsp.length;
    //    let rand = Math.round(Math.random() * (pspCounts - 1) + 1);
    //    const id = dataPsp[rand - 1];
    //   code = id.code;
    // } else {
    //   const pspData = terminalInfo.psp.split(',');
    //    const pspCounts = pspData.length;
    //   let rand = Math.round(Math.random() * (pspCounts - 1) + 1);
    //   const id = await this.ipgListModel.findOne({ _id: pspData[rand - 1] });
    //   console.log(id, 'id')

    //   code = id.code;
    // }

    const directLength = directTerminal.direct.length;
    let rand = Math.round(Math.random() * (directLength - 1) + 1);
    let tmp = 'Tmp-' + new Date().getTime();
    ipgDto.tmp = tmp;

    const res = await this.selectorIPG(
      ipgDto,
      directTerminal.direct[rand - 1].psp,
      directTerminal.direct[rand - 1],
      tmp,
      callback
    );

    ipgDto.token = res.token;
    ipgDto.type = res.type;
    ipgDto.orderid = res.orderid;
    ipgDto.details = { respmsg: 'در انتظار مشتری' };
    ipgDto.terminalinfo = directTerminal.direct[rand - 1];
    ipgDto.pardakhtyari = directTerminal.direct[rand - 1].pardakhtyari;
    ipgDto.auth = authStatus;
    // const title = 'پرداخت درگاه اینترنتی ';
    // const log = this.setLogg(title, ipgDto.userinvoice, ipgDto.amount, false, ipgDto.user, ipgDto.user);
    // this.loggerService.newLogg(log);
    return await this.newReqSubmit(ipgDto);
  }

  async checkOut(digirep, terminalID): Promise<any> {
    const ttttt = await this.client.post('Advice', {
      digitalreceipt: digirep,
      Tid: terminalID,
    });
    return ttttt.data;
  }

  async guestMode(invoiceid, amount, mobile, callbackurl): Promise<any> {
    const title = 'خرید وچر';
    await this.loggerService.guestLog(title, invoiceid, amount, false, mobile);
    return this.ipgModel.create({
      mobile: mobile,
      amount: amount,
      invoiceid: invoiceid,
      callbackurl: callbackurl,
    });
  }

  async getInfo(invoiceid: string): Promise<any> {
    return this.ipgModel.findOne({ invoiceid: invoiceid });
  }

  async getAll(id: string): Promise<any> {
    return this.ipgModel.findOne({ _id: id });
  }

  async getAllReport(from, to, page): Promise<any> {
    return this.ipgModel
      .paginate(
        {
          createdAt: { $gte: from, $lte: to },
        },
        { page, populate: 'user', sort: { createdAt: -1 }, limit: 50 }
      )
      .catch((err) => {
        console.log(err, 'err');
        return err;
      });
  }
  async getAllReportWithQuery(query, page): Promise<any> {
    return this.ipgModel
      .paginate(query, { page, populate: 'user', sort: { createdAt: -1 }, limit: 50 })
      .catch((err) => {
        console.log(err, 'err');
        return err;
      });
  }

  async getAgentReport(id, userid, page, start?, end?): Promise<any> {
    return this.ipgReportService.getReport(userid, id, page, start, end);
  }

  async typeSelector(type, amount, percent): Promise<any> {
    switch (type) {
      case IPGTypes.percent: {
        return discountChangable(amount, percent);
      }

      case IPGTypes.amount: {
        const money = amount - percent;
        return {
          discount: percent,
          total: amount,
          amount: money,
        };
      }

      case IPGTypes.abonman: {
        return {
          discount: 0,
          total: amount,
          amount: amount,
        };
      }

      default: {
        return discountChangable(amount, 5);
      }
    }
  }

  async addDetailsInternal(ref, respcode, respmsg, cardno): Promise<any> {
    return this.ipgModel.findOneAndUpdate(
      { ref: ref },
      {
        details: {
          respcode: respcode,
          respmsg: respmsg,
          cardnumber: cardno,
        },
      }
    );
  }

  async addDetailsAddSuccess(userinvoice: string, respcode, respmsg, cardno, rrn): Promise<any> {
    return this.ipgModel.findOneAndUpdate(
      { token: userinvoice },
      {
        details: {
          rrn: rrn,
          respcode: respcode,
          respmsg: respmsg,
          cardnumber: cardno,
        },
      }
    );
  }

  async ipgFilterReport(query, page): Promise<any> {
    return this.ipgModel.paginate(query, { page, sort: { createdAt: -1 }, limit: 50 });
  }

  async ipgFilterReportExcel(query): Promise<any> {
    return this.ipgModel.find(query);
  }

  async ipgListAdd(getInfo: IpgListCoreDto): Promise<any> {
    return this.ipgListModel.create(getInfo);
  }

  async ipgListChangeStatus(id: string, status: boolean): Promise<any> {
    return this.ipgListModel.findOneAndUpdate(
      {
        _id: id,
      },
      { status: status }
    );
  }

  async getIpgList(): Promise<any> {
    return this.ipgListModel.find({ status: true }).select({ __V: 0, createdAt: 0, updatedAt: 0 });
  }

  async getTotalByDate(): Promise<any> {
    return this.ipgModel.aggregate([
      {
        $match: {
          userinvoice: /Ipg-/,
          // createdAt: { $gte: todayDate.start },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          counter: { $sum: 1 },
        },
      },
    ]);
  }

  async getSuccessByDate(): Promise<any> {
    return this.ipgModel.aggregate([
      {
        $match: {
          userinvoice: /Ipg-/,
          'details.respcode': { $eq: 0 },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          counter: { $sum: 1 },
        },
      },
    ]);
  }

  async getfaildByDate(): Promise<any> {
    return this.ipgModel.aggregate([
      {
        $match: {
          'details.respcode': { $ne: 0 },
          userinvoice: /Ipg-/,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          counter: { $sum: 1 },
        },
      },
    ]);
  }

  async getLast15DaysSuccessChart(limit: number): Promise<any> {
    return this.ipgModel.aggregate([
      {
        $match: {
          userinvoice: /Ipg-/,
          'details.respcode': { $eq: 0 },
        },
      },
      {
        $group: {
          _id: {
            $add: [{ $dayOfYear: '$createdAt' }],
          },
          day: { $sum: 1 },
          amounti: { $sum: '$total' },
          first: { $min: '$createdAt' },
        },
      },
      { $sort: { first: -1 } },
      { $limit: limit },
      { $project: { date: '$first', day: 1, userinvoice: 1, amount: '$amounti', _id: 1 } },
    ]);
  }

  async getLast15DaysFaildChart(limit): Promise<any> {
    return this.ipgModel.aggregate([
      {
        $match: {
          userinvoice: /Ipg-/,
          'details.respcode': { $ne: 0 },
        },
      },
      {
        $group: {
          _id: {
            $add: [
              { $dayOfYear: '$createdAt' },
              {
                $multiply: [430, { $year: '$createdAt' }],
              },
            ],
          },
          day: { $sum: 1 },
          amounti: { $sum: '$amount' },
          first: { $min: '$createdAt' },
        },
      },
      { $sort: { first: -1 } },
      { $limit: limit },
      { $project: { date: '$first', day: 1, userinvoice: 1, amount: '$amounti', _id: 0 } },
    ]);
  }

  async getTotalSuccess(query): Promise<any> {
    return this.ipgModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalz: { $sum: '$amount' },
          discount: { $sum: '$discount' },
        },
      },
      { $project: { count: 1, totalz: 1, discount: 1 } },
    ]);
  }

  async addUserInvoiceDetails(userinvoice: string, details): Promise<any> {
    return this.ipgModel.findOneAndUpdate({ userinvoice: userinvoice }, { details: details });
  }

  async calcWage(traxInfo, terminalInfo) {
    if (!traxInfo.wagetype) throw new InternalServerErrorException();

    if (traxInfo.isdirect == false && traxInfo.pardakhtyari == false) {
      await this.chargeWallet(traxInfo, terminalInfo);
    }
  }

  async chargeWallet(traxInfo, terminalInfo): Promise<any> {
    if (traxInfo.discount > 0) {
      const wage = Math.round((65 * traxInfo.discount) / 100);
      const merchantWage = traxInfo.discount - wage;
      await this.accountService.chargeAccount(terminalInfo.ref, 'wallet', merchantWage);
      const title = ' کارمزد ثبت فروشگاه اینترنتی ' + terminalInfo.title;
      await this.accountService.accountSetLoggWithRef(
        title,
        'Wage' + traxInfo.userinvoice,
        merchantWage,
        true,
        null,
        terminalInfo.ref
      );
    }

    await this.confirmTrax(traxInfo.terminalid, traxInfo.invoiceid);
    await this.accountService.chargeAccount(terminalInfo.user, 'wallet', traxInfo.amount);
    const title = ' خرید از فروشگاه اینترنتی با شماره کارت ' + traxInfo.details.cardnumber;
    await this.accountService.accountSetLoggWithRef(
      title,
      traxInfo.userinvoice,
      traxInfo.amount,
      true,
      null,
      terminalInfo.user
    );
  }

  async dechargeWallet(traxInfo, terminalInfo): Promise<any> {
    if (traxInfo.discount > 0) {
      const wage = Math.round((65 * traxInfo.discount) / 100);
      const merchantWage = traxInfo.discount - wage;
      await this.accountService.chargeAccount(terminalInfo.ref, 'wallet', merchantWage);
      const title = ' کارمزد ثبت فروشگاه اینترنتی ' + terminalInfo.title;
      await this.accountService.accountSetLoggWithRef(
        title,
        'Wage' + traxInfo.userinvoice,
        merchantWage,
        true,
        null,
        terminalInfo.ref
      );
    }

    //    await this.confirmTrax(traxInfo.terminalid, traxInfo.invoiceid );
    await this.accountService.dechargeAccount(terminalInfo.user, 'wallet', traxInfo.discount);
    const title = ' خرید از فروشگاه اینترنتی با شماره کارت ' + traxInfo.details.cardnumber;
    await this.accountService.accountSetLoggWithRef(
      title,
      traxInfo.userinvoice,
      traxInfo.total,
      true,
      null,
      terminalInfo.user
    );
    const titlex = 'کسر کارمزد خرید از فروشگاه اینترنتی با شماره کارت ' + traxInfo.details.cardnumber;
    await this.accountService.accountSetLoggWithRef(
      titlex,
      traxInfo.userinvoice,
      traxInfo.discount,
      true,
      terminalInfo.user,
      null
    );
  }

  async updateCallback(id: string, callback: string): Promise<any> {
    return this.ipgModel.findOneAndUpdate({ _id: id }, { $set: { callbackurl: callback } });
  }

  async getAllTransactionsByTerminalId(page: number, terminalid: number): Promise<any> {
    const aggregate = this.ipgModel.aggregate([
      { $match: { terminalid: terminalid } },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          numericOrderid: { $toInt: '$orderid' },
        },
      },
      {
        $lookup: {
          from: 'pspverifies',
          localField: 'numericOrderid',
          foreignField: 'TraxID',
          as: 'verifyResult',
        },
      },
      {
        $unwind: {
          path: '$verifyResult',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          details: 1,
          confirm: 1,
          reverse: 1,
          direct: 1,
          isdirect: 1,
          pardakhtyari: 1,
          auth: 1,
          ref: 1,
          terminalid: 1,
          terminalinfo: 1,
          amount: 1,
          invoiceid: 1,
          userinvoice: 1,
          createdAt: 1,
          updatedAt: 1,
          orderid: 1,
          verifyResult: 1,
          numericOrderid: 1,
        },
      },
    ]);
    const paginateOptions = {
      limit: 50,
      page,
    };
    const result = await this.ipgModel.aggregatePaginate(aggregate, paginateOptions);
    return result;
  }
}
