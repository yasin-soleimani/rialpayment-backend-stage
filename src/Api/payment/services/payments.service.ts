import {
  faildOpt,
  Injectable,
  InternalServerErrorException,
  successOpt,
  successOptWithDataNoValidation,
} from '@vision/common';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { PaymentDto } from '../dto/payment.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import axios, { AxiosInstance } from 'axios';
import { PaymentCommonService } from './payment-common.service';
import { sendNotif } from '@vision/common/notify/notify.util';
import { TrasnferReturn } from '@vision/common/formatter/switch.format';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { isNullOrUndefined } from 'util';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { SafeBoxSendMessage } from '@vision/common/messages/SMS';
import { notEnoughMoneyException } from '@vision/common/exceptions/notEnoughMoney.exception';
import { GeneralService } from '../../../Core/service/general.service';
import * as UniqueNumber from 'unique-number';
import { SafeboxCoreService } from '../../../Core/safebox/safebox.sevice';
import { sendSocketMessage } from '@vision/common/notify/socket.util';
import { AccountBlockService } from '../../../Core/useraccount/account/services/account-block.service';
import { PaymentCarsTransApiService } from './cardTrans.service';
import * as qs from 'querystring';
import * as process from 'process';

@Injectable()
export class PaymentsService {
  private client: AxiosInstance;

  constructor(
    private readonly accountService: AccountService,
    private readonly accountBlockService: AccountBlockService,
    private readonly commonService: PaymentCommonService,
    private readonly safeBoxService: SafeboxCoreService,
    private readonly generalService: GeneralService,
    private readonly userService: UserService,
    private readonly cardTransService: PaymentCarsTransApiService
  ) {
    this.client = axios.create({
      baseURL: process.env.SOCKET_SERVICE_URL.startsWith('http')
        ? process.env.SOCKET_SERVICE_URL
        : 'https://' + process.env.SOCKET_SERVICE_URL,
    });
  }

  async trasnfer(getInfo: PaymentDto, userid): Promise<any> {
    // await this.commonService.checkTransfer(getInfo);
    const user = await this.commonService.getUserByUserID(userid);
    const merchant = await this.commonService.getUserInfoByPayID(getInfo.payid);

    const cardInfo = await this.commonService.checkPin(userid, getInfo.pin);
    await this.commonService.checkBalance(user, getInfo.amount);
    await this.checkBalanceTrans(userid, getInfo.amount);

    await this.accountService.dechargeAccount(userid, 'wallet', getInfo.amount);
    await this.accountService.chargeAccount(merchant._id, 'wallet', getInfo.amount);

    let title;
    if (isEmpty(getInfo.description)) {
      title = 'انتقال وجه به ' + merchant.fullname + ' توسط ' + user.fullname;
    } else {
      title = 'انتقال وجه به ' + merchant.fullname + ' توسط ' + user.fullname + '-' + getInfo.description;
    }
    const logInfo = await this.accountService.accountSetLogg(title, 'Trans', getInfo.amount, true, user, merchant._id);

    const message = 'مبلغ : ' + getInfo.amount + ' ریال \n' + 'پرداخت با موفقیت انجام شد';
    sendNotif(merchant.fcm, getInfo.amount, 2);
    sendSocketMessage(merchant.clientid, message).catch((e) => console.log('send socket message error: ', e));
    return successOptWithDataNoValidation(
      TrasnferReturn(cardInfo.cardno, user.fullname, getInfo.amount, logInfo.ref, [], '')
    );
  }

  async checkWalletTransferType(paymentDto: PaymentDto, userid: string): Promise<any> {
    const userInfo = await this.userService.getInfoByUserid(userid);
    if (userInfo.block === true)
      throw new UserCustomException('متاسفانه حساب شما مسدود شده است با پشتیبانی تماس بگیرید');
    if (userInfo.checkout && userInfo.checkout === false)
      throw new UserCustomException('متاسفانه شما نمی توانید پول را انتقال دهید', false, 500);

    await this.checkBalanceTrans(userid, paymentDto.amount);
    if (paymentDto.payid.length == 16) {
      return this.cardTransService.play(paymentDto, userid);
    }

    const destInfo = await this.userService.getInfoByAccountNo(paymentDto.payid);
    const reg = new RegExp(/^0([\d]{0})[(\D\s)]?[\d]{11}$/);
    const transType = paymentDto.payid.match(reg);
    if (destInfo && !transType) {
      return await this.trasnfer(paymentDto, userid);
    } else {
      if (paymentDto.payid.length != 13) throw new UserCustomException('مقصد نامعتبر');
      const split = paymentDto.payid.split('_');
      if (split.length != 2) throw new UserCustomException('مقصد نامعتبر');
      return await this.safeBoxTransfer(paymentDto, userid);
    }
  }

  async safeBoxTransfer(paymentDto: PaymentDto, userid): Promise<any> {
    const userInfo = await this.userService.getInfoByUserid(userid);
    if (!userInfo) throw new InternalServerErrorException();
    if (userInfo.block == true)
      throw new UserCustomException('متاسفانه حساب شما مسدود شده است با پشتیبانی تماس بگیرید');
    if (userInfo.checkout == false) throw new UserCustomException('متاسفانه حساب کاربری شما اعتبار سنجی نشده است');
    const mobile = paymentDto.payid.split('_');
    await this.checkBalanceTrans(userid, paymentDto.amount);
    let title;
    if (isEmpty(paymentDto.description)) {
      title = 'انتقال وجه به ' + mobile[1];
    } else {
      title = 'انتقال وجه به ' + mobile[1] + '-' + paymentDto.description;
    }
    const uniqueNumber = new UniqueNumber(true);
    const ref = 'Trans-';
    const info = this.safeBoxService.safeboxSetter(mobile[1], paymentDto.amount, userid, ref);
    const data = await this.safeBoxService.newItem(info);
    if (!data) throw new InternalServerErrorException();
    // this.accountService.accountSetLogg(title, ref, paymentDto.amount, true, userid, userid);
    await this.accountService.dechargeAccount(userid, 'wallet', paymentDto.amount);
    const logInfo = await this.accountService.accountSetLogg(
      title,
      ref,
      paymentDto.amount,
      true,
      userid,
      null,
      mobile[1]
    );
    const user = await this.userService.findUserAll(userid);
    if (!user) throw new UserNotfoundException();
    if (logInfo) {
      const Message = SafeBoxSendMessage(paymentDto.amount, user.fullname);
      this.generalService.AsanaksendSMS(
        process.env.ASANAK_USERNAME,
        process.env.ASANAK_PASSWORD,
        process.env.ASANAK_NUMBER,
        mobile[1],
        Message
      );
      return successOpt();
    } else {
      await this.accountService.chargeAccount(userid, 'wallet', paymentDto.amount);
      return faildOpt();
    }
  }

  async checkBalanceTrans(userid, amount): Promise<any> {
    let blockAmount,
      todayAmount = 0;
    const data = await this.accountService.getBalance(userid, 'wallet');
    const block = await this.accountBlockService.getBlock(userid);
    const todayCharge = await this.accountService.getTodayCharge(userid);

    if (block.length > 0) {
      blockAmount = block[0].total;
    }
    if (todayCharge.length > 0) {
      todayAmount = todayCharge[0].total;
    }

    const total = data.balance - blockAmount - todayCharge;

    if (data) {
      if (total < amount) {
        throw new notEnoughMoneyException();
      }
    } else {
      throw new UserCustomException('متاسفانه عملیات با خطا مواجه شده است', false, 500);
    }
  }

  async installments(): Promise<any> {}
}
