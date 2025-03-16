import { Injectable } from '@vision/common';
import { BillInquiryCoreService } from '../../Core/bill-inquiry/bill-inquiry.service';
import { BillInquiryApiDto } from './dto/bill-inquiry.dto';
import { BillInquiryCallbackApiService } from './services/callback.service';
import { BillInquiryPaymentApiService } from './services/payment.service';

@Injectable()
export class BillInquiryApiService {
  constructor(
    private readonly inquiryService: BillInquiryCoreService,
    private readonly paymentService: BillInquiryPaymentApiService,
    private readonly callbackService: BillInquiryCallbackApiService
  ) {}

  async getInfoBill(userid: string, getInfo: BillInquiryApiDto, referer: string): Promise<any> {
    return this.inquiryService.play(userid, getInfo.type, getInfo.id, getInfo.title, getInfo.isSave, referer);
  }

  async getPaidList(userid: string, page: number, type: number): Promise<any> {
    return this.inquiryService.getPaidList(userid, page, type);
  }

  async payment(id: string, userid: string, devicetype: string, response): Promise<any> {
    return this.paymentService.getPayment(id, userid, devicetype, response);
  }

  async callback(getInfo, response): Promise<any> {
    return this.callbackService.callback(getInfo, response);
  }
}
