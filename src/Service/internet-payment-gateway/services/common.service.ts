import { Injectable } from '@vision/common';
import * as momentjs from 'jalali-moment';

@Injectable()
export class InternetPaymentGatewayCommonService {
  constructor() {}

  async checkip(ipgData, ip): Promise<any> {
    if (ipgData.ip == ip || ipgData.ip2 == ip || ipgData.ip3 == ip || ipgData.ip4 == ip || ipgData.ip5 == ip) {
      return false;
    } else {
      return true;
    }
  }

  async getDiff(time): Promise<any> {
    const now = momentjs();
    const difftime = momentjs(time);

    return now.diff(difftime, 'minutes');
  }
}
