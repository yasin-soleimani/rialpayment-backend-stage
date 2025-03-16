import { Injectable, InternalServerErrorException, successOpt } from '@vision/common';
import { ShaparakTerminalTypeConst } from '../../../Service/internet-payment-gateway/const/terminal-type.const';
import { InternetPaymentGatewaySwitchFormatFunction } from '../../../Service/internet-payment-gateway/function/switch-format.func';
import { SwitchService } from '../../../Switch/next-generation/switch.service';
import * as Sha256 from 'sha256';
import { PspverifyCoreService } from '../../../Core/psp/pspverify/pspverifyCore.service';
import { LoggercoreService } from '../../../Core/logger/loggercore.service';
import { BillInquiryRedirectv } from '../function/redirect.func';
import { BillInquiryIpgApiService } from './ipg.service';
import { BillInquiryPaymentCoreService } from '../../../Core/bill-inquiry/payment/payment.service';
import { BillInquiryCommonService } from '../../../Core/bill-inquiry/services/common.service';
import { ClubPwaService } from '../../../Core/clubpwa/club-pwa.service';

@Injectable()
export class BillInquirySwitchApiService {
  private baseUrl = 'https://portal.rialpayment.ir/billinquiry-status?';

  constructor(
    private readonly ipgService: BillInquiryIpgApiService,
    private readonly switchService: SwitchService,
    private readonly pspVerifyService: PspverifyCoreService,
    private readonly loggerService: LoggercoreService,
    private readonly bankService: BillInquiryPaymentCoreService,
    private readonly commonService: BillInquiryCommonService,
    private readonly clubPwaService: ClubPwaService
  ) {}

  async payment(billInfo, cardInfo, orderid, acceptorcode, terminalid, devicetype, response, ipg?): Promise<any> {
    const pin = Sha256(cardInfo.pin);

    const switchReq = InternetPaymentGatewaySwitchFormatFunction(
      104,
      orderid,
      cardInfo.cardno,
      cardInfo.track2,
      terminalid,
      acceptorcode,
      new Date(),
      billInfo.amount,
      pin,
      ShaparakTerminalTypeConst.Internet
    );

    const res = await this.switchService.action(switchReq);

    return this.resultSwitch(res, pin, billInfo, devicetype, response, ipg);
  }

  private async verify(info, pin: string, billInfo, devicetype, response, ipg?): Promise<any> {
    const switchReq = InternetPaymentGatewaySwitchFormatFunction(
      106,
      info.TraxID,
      info.CardNum,
      info.CardNum,
      info.TermID,
      info.Merchant,
      new Date(),
      info.TrnAmt,
      pin,
      ShaparakTerminalTypeConst.Internet
    );
    const switchResult = await this.switchService.action(switchReq);

    const result = this.rsSwitch(switchResult.rsCode);
    if (!result) throw new InternalServerErrorException();

    const pspInfo = await this.pspVerifyService.getTraxInfoByTraxIdWithLog(info.TraxID);

    this.loggerService.updateLogWithQueryAndId(pspInfo.log._id, {
      $set: {
        ref: 'BillInquiry-' + new Date().getTime(),
        title: 'پرداخت قبض',
      },
    });

    const newBillInfo = await this.commonService.getBillInfoById(billInfo._id);

    const clubPwaData = await this.clubPwaService.getClubPwaByReferer(newBillInfo.referer);

    await this.commonService.update(billInfo._id, { paid: true });
    return BillInquiryRedirectv(newBillInfo, true, this.baseUrl, devicetype, response, clubPwaData, ipg);
  }

  private async resultSwitch(result, pin, billInfo, devicetype, response, ipg?): Promise<any> {
    if (result.CommandID == 204 && result.rsCode == 20) {
      const bankResult = await this.bankPayment(billInfo);
      if (bankResult) return this.verify(result, pin, billInfo, devicetype, response, ipg);

      return {
        status: 500,
        success: false,
        message: 'پرداخت با خطا مواجه شده است , مبلغ قبض به حساب شما عودت داده خواهد شد',
      };
    } else if (result.CommandID == 204 && result.rsCode == 11) {
      // redirect to Ipg
      const data = await this.ipgService.getTokenIpg(billInfo, billInfo.user, devicetype);
      return response.json({
        status: 200,
        success: true,
        message: 'عملیات با موفقیت انجام شد',
        token: data,
      });
    } else {
      throw new InternalServerErrorException();
    }
  }

  private rsSwitch(rscode) {
    switch (rscode) {
      case 17: {
        return true;
      }

      default: {
        return false;
      }
    }
  }

  private async bankPayment(billInfo): Promise<any> {
    const data = await this.bankService.payment(billInfo.billid, billInfo.paymentid, billInfo.amount);
    if (!data) return false;

    if (data.traceNumber) {
      if (data.traceNumber > 0) {
        return this.commonService
          .update(billInfo._id, {
            bankresponse: JSON.stringify(data),
            ref: data.traceNumber,
            status: true,
          })
          .then((res) => {
            return true;
          })
          .catch((err) => {
            return false;
          });
      } else {
        this.commonService.update(billInfo._id, {
          bankresponse: JSON.stringify(data),
          status: false,
        });
        return false;
      }
    } else {
      this.commonService.update(billInfo._id, {
        bankresponse: JSON.stringify(data),
        status: false,
      });
      return false;
    }
  }
}
