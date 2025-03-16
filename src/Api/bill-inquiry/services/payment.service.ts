import { Injectable, NotFoundException } from '@vision/common';
import { InternetPaymentGatewaySwitchFormatFunction } from 'src/Service/internet-payment-gateway/function/switch-format.func';
import { BillInquiryCommonService } from '../../../Core/bill-inquiry/services/common.service';
import { CardService } from '../../../Core/useraccount/card/card.service';
import { BillInquirySwitchApiService } from './switch.service';

@Injectable()
export class BillInquiryPaymentApiService {
  constructor(
    private readonly cardService: CardService,
    private readonly billCommonService: BillInquiryCommonService,
    private readonly paymentService: BillInquirySwitchApiService
  ) { }

  async getPayment(id, userid: string, devicetype: string, response, ipg?): Promise<any> {
    const billInfo = await this.billCommonService.getBillInfoById(id);
    if (!billInfo) throw new NotFoundException('قبض یافت نشد');
    if (billInfo.status == true) throw new NotFoundException('قبض یافت نشد');
    if (billInfo.paid == true) throw new NotFoundException('قبض یافت نشد');

    const cardInfo = await this.cardService.getCardByUserID(userid);
    if (!cardInfo) throw new NotFoundException('کارت یافت نشد');

    const orderId = new Date().getTime();
    return this.paymentService.payment(
      billInfo,
      cardInfo,
      orderId,
      process.env.BILL_INQUIRY_MERCHANT,
      process.env.BILL_INQUIRY_TERMINAL,
      devicetype,
      response,
      ipg
    );
  }
}
