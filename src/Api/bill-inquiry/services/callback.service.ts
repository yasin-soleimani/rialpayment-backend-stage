import { Injectable, InternalServerErrorException } from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { LoggercoreService } from '../../../Core/logger/loggercore.service';
import { IpgCoreService } from '../../../Core/ipg/ipgcore.service';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { BillInquiryRedirectv } from '../function/redirect.func';
import { BillInquiryPaymentApiService } from './payment.service';
import { ClubPwaService } from '../../../Core/clubpwa/club-pwa.service';
import { BillInquiryCommonService } from '../../../Core/bill-inquiry/services/common.service';

@Injectable()
export class BillInquiryCallbackApiService {
  constructor(
    private readonly ipgService: IpgCoreService,
    private readonly accountService: AccountService,
    private readonly paymentService: BillInquiryPaymentApiService,
    private readonly loggerService: LoggercoreService,
    private readonly clubPwaService: ClubPwaService,
    private readonly billInquiryService: BillInquiryCommonService
  ) { }
  async callback(getInfo, response): Promise<any> {
    const payInfo = await this.ipgService.getTraxInfo(getInfo.terminalid, getInfo.ref);
    if (!payInfo) throw new UserCustomException('تراکنش یافت نشد');
    let parsed;

    if (payInfo.payload && payInfo.payload.length > 1) {
      parsed = JSON.parse(payInfo.payload);
    } else {
      throw new UserCustomException('تراکنش با خطا مواجه شده است', false, 500);
    }

    let amount = payInfo.amount;
    if (payInfo.total) {
      amount = payInfo.total;
    }
    const nullInfo = {
      billid: parsed.billId,
      paymentid: 0,
      amount: amount,
      type: 0,
    };

    const billData = await this.billInquiryService.getBillInfoById(parsed.billDbId);
    const clubPwaData = await this.clubPwaService.getClubPwaByReferer(billData.referer);

    if (getInfo.respcode == 0) {
      const verify = await this.ipgService.verify(getInfo.terminalid, payInfo.userinvoice);
      if (!verify) throw new InternalServerErrorException();

      if (verify.status == 0 && verify.success == true) {
        const title = 'شارژ کیف پول جهت پرداخت قبوض';

        if (payInfo.retry < 2) {
          await this.accountService.chargeAccount(parsed.userId, 'wallet', amount);
          this.accountService.accountSetLoggWithRef(title, payInfo.invoiceid, payInfo.total, true, null, parsed.userId);
        }

        // await this.loggerService.updateLogWithQueryAndRef(payInfo.userinvoice, {
        //   $set: { title: title }
        // });

        return this.paymentService.getPayment(parsed.billDbId, parsed.userId, parsed.devicetype, response, true);
      } else {
        BillInquiryRedirectv(nullInfo, false, null, parsed.devicetype, response, clubPwaData, true);
      }
    } else {
      BillInquiryRedirectv(nullInfo, false, null, parsed.devicetype, response, clubPwaData, true);
    }
  }
}
