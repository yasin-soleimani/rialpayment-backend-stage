import { Injectable, NotFoundException, successOpt, successOptWithDataNoValidation } from '@vision/common';
import { IpgCoreService } from '../../../Core/ipg/ipgcore.service';
import { MipgCoreService } from '../../../Core/mipg/mipg.service';
import { PaymentCommonService } from './payment-common.service';
import { PaymentDto } from '../dto/payment.dto';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import axios, { AxiosInstance } from 'axios';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { imageTransform } from '@vision/common/transform/image.transform';
import * as qs from 'querystring';
import { CardService } from '../../../Core/useraccount/card/card.service';
import { TrasnferReturn } from '@vision/common/formatter/switch.format';
import { isEmpty } from 'rxjs/operators';

@Injectable()
export class PaymentSafeService {
  private client: AxiosInstance;

  constructor(
    private readonly ipgService: IpgCoreService,
    private readonly mipgService: MipgCoreService,
    private readonly commonService: PaymentCommonService,
    private readonly accountService: AccountService,
    private readonly cardService: CardService
  ) {
    this.client = axios.create({
      baseURL: 'http://localhost:61231/',
      timeout: 5000,
    });
  }

  async getInformation(getInfo: PaymentDto): Promise<any> {
    const splited = getInfo._id.split('_');
    const ipgData = await this.ipgService.findByRef(splited[1]);
    const terminalInfo = await this.mipgService.getInfo(ipgData.terminalid);
    if (!terminalInfo) throw new NotFoundException();

    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      fullname: terminalInfo.title,
      avatar: imageTransform(terminalInfo.logo),
      merchant: null,
    };
  }

  async IpgSafePayment(getInfo: PaymentDto, userid): Promise<any> {
    console.log(getInfo);
    const user = await this.commonService.getUserByUserID(userid);
    const cardInfo = await this.commonService.checkPin(userid, getInfo.pin);

    const paySplited = getInfo._id.split('_');
    const ipgData = await this.ipgService.findByRef(paySplited[1]);
    if (!ipgData) throw new UserCustomException('خرید یافت نشد');
    console.log(ipgData, 'ipgx');

    const terminalInfo = await this.mipgService.getInfo(ipgData.terminalid);
    if (terminalInfo.status == false) throw new UserCustomException('پایانه غیرفعال می باشد');
    await this.commonService.checkBalance(user, ipgData.amount);

    await this.accountService.dechargeAccount(userid, 'wallet', ipgData.amount);
    const maskedCard = this.maskCard(cardInfo.cardno);
    await this.ipgService.addDetailsInternal(paySplited[1], 11, 'در انتظار پرداخت ', maskedCard);

    const title = 'خرید اینترنتی از فروشگاه ' + terminalInfo.title;
    this.accountService.accountSetLogg(title, 'Pay', ipgData.amount, true, userid, terminalInfo.user);
    const { data } = await this.sendToSafePay(userid, paySplited[1]);
    if (data.status != 200) {
      await this.reverse(userid, terminalInfo, ipgData, paySplited);
      throw new UserCustomException('پرداخت با خطا مواجه شده است');
    }
    await this.settle(cardInfo, terminalInfo, ipgData, paySplited);
    return successOptWithDataNoValidation(
      TrasnferReturn(cardInfo.cardno, terminalInfo.title, ipgData.amount, paySplited[1], [], '')
    );
  }

  private async sendToSafePay(userid, ref): Promise<any> {
    const data = qs.stringify({
      userid: userid,
      ref: ref,
    });
    return this.client
      .post('/safepay', data)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return {
          data: {
            status: 500,
          },
        };
      });
  }

  private async settle(cardInfo, terminalInfo, ipgData, paySplited): Promise<any> {
    const money = await this.ipgService.typeSelector(ipgData.paytype, ipgData.amount, ipgData.karmozd);
    await this.accountService.chargeAccount(terminalInfo.user, 'wallet', money.amount);
    const maskedCard = this.maskCard(cardInfo.cardno);
    await this.ipgService.addDetailsInternal(paySplited[1], 0, 'عملیات با موفقیت انجام شد', maskedCard);
  }

  private async reverse(userid, terminalInfo, ipgData, paySplited): Promise<any> {
    const title = 'بازگشت مبلغ خرید از فروشگاه ' + terminalInfo.title;
    await this.accountService.chargeAccount(userid, 'wallet', ipgData.amount);
    this.accountService.accountSetLogg(title, 'Pay', ipgData.amount, true, userid, terminalInfo.user);
    await this.ipgService.addDetailsInternal(paySplited[1], -5, 'عملیات با خطا مواجه شده است', null);
    throw new UserCustomException('پرداخت با خطا مواجه شده است');
  }

  private maskCard(cardNumber) {
    return cardNumber.toString().replace(/(?<=.{6}).(?=.{4})/g, '*');
  }
}
