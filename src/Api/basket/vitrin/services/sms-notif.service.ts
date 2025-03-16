import { Injectable } from '@vision/common';
import { GeneralService } from '../../../../Core/service/general.service';

@Injectable()
export class BasketVitrinSmsNotifService {
  private asanakData: any;

  constructor(private readonly generalService: GeneralService) {
    this.asanakData = {
      username: process.env.ASANAK_USERNAME,
      password: process.env.ASANAK_PASSWORD,
      asanakNumber: process.env.ASANAK_NUMBER,
    };
  }

  async sendSmsToBuyer(
    shopName: string,
    mobile: any,
    invoiceid: any,
    deliveryTime: string,
    phone,
    cashOnDelivery = false
  ): Promise<any> {
    const message =
      'خرید شما از فروشگاه' +
      ' ' +
      shopName +
      ' ' +
      'با موفقیت ثبت شد \n' +
      'زمان تحویل:' +
      ' ' +
      deliveryTime +
      '\n' +
      `${cashOnDelivery ? 'نوع: پرداخت درب محل\n' : ''}` +
      'کد پیگیری: ' +
      invoiceid.toString() +
      '\n' +
      'پشتیبانی:' +
      ' ' +
      phone;

    const destinationMobile = '0' + mobile;
    this.generalService.AsanaksendSMS(
      this.asanakData.username,
      this.asanakData.password,
      this.asanakData.asanakNumber,
      destinationMobile,
      message
    );
  }

  async sendSmsToSeller(
    shopName: string,
    mobile: any,
    invoiceid,
    deliveryTime: string,
    isCashOnDelivery = false
  ): Promise<any> {
    const message =
      ' ریال پیمنت \n' +
      'یک خرید جدید از فروشگاه' +
      ' ' +
      shopName +
      ' ' +
      'انجام شده است \n' +
      `${isCashOnDelivery ? 'نوع: پرداخت درب محل\n' : ''}` +
      'زمان تحویل:' +
      ' ' +
      deliveryTime +
      '\n' +
      'کد پیگیری: ' +
      invoiceid.toString();
    const destinationMobile = '0' + mobile;
    this.generalService.AsanaksendSMS(
      this.asanakData.username,
      this.asanakData.password,
      this.asanakData.asanakNumber,
      destinationMobile,
      message
    );
  }
}
