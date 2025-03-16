import { Injectable } from '@vision/common';
import { IpgCoreService } from '../../../Core/ipg/ipgcore.service';
import { InternetPaymentGatewayCommonService } from './common.service';
import { MipgCoreService } from '../../../Core/mipg/mipg.service';
import { makeCaptcha } from '@vision/common/utils/captcha-maker.util';

@Injectable()
export class InternetPaymentGatewayGetPayment {
  constructor(
    private readonly ipgService: IpgCoreService,
    private readonly mipgService: MipgCoreService,
    private readonly commonService: InternetPaymentGatewayCommonService
  ) {}

  async getPaymentInfo(token: string, session): Promise<any> {
    const tokenInfo = await this.ipgService.findByUserInvoice(token);

    const expireTime = await this.commonService.getDiff(tokenInfo.createdAt);
    if (tokenInfo.launch == true || expireTime > 9) {
      return {
        status: 400,
      };
    }

    this.ipgService.launchTrue(tokenInfo.userinvoice);
    const captcha = await makeCaptcha();
    session.captcha = captcha.data;

    const mipgInfo = await this.mipgService.getInfo(tokenInfo.terminalid);
    return {
      status: 200,
      logo: mipgInfo.logo,
      amount: await this.addCommas(tokenInfo.amount),
      title: mipgInfo.title,
      site: mipgInfo.url,
      token: tokenInfo.userinvoice,
      rf: tokenInfo.ref,
      id: session.id,
      captcha: captcha.base64,
    };
  }

  /**
   * Add Commas to numbers
   *
   * @method addCommas
   * @param  eg: 300000
   * @return A string of separated numbers by commas, eg: 30,000
   */
  private async addCommas(number?: number | string): Promise<string | undefined> {
    if (typeof number === 'undefined') return;

    const convertedToString = number.toString();

    return convertedToString.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }
}
