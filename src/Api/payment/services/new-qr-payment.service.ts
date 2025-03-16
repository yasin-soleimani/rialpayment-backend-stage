import {
  Injectable,
  successOptWithDataNoValidation,
  InternalServerErrorException,
  BadRequestException,
} from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { getMacAddress } from '@vision/common/services/get-mac.service';
import { timeDuration } from '@vision/common/utils/month-diff.util';
import { LoggercoreService } from '../../../Core/logger/loggercore.service';
import { notEnoughMoneyException } from '@vision/common/exceptions/notEnoughMoney.exception';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { SwitchMobileService } from '../../../Switch/next-generation/services/mobile/switch-mobile.service';
import { sendNotif } from '@vision/common/notify/notify.util';
import { VoucherCoreService } from '../../../Core/voucher/voucher.service';
require('node-go-require');
import axios, { AxiosInstance } from 'axios';
import * as qs from 'querystring';
import { PaymentGroupProjectApiService } from './group-project.service';
import { decryptionString } from '../crypto/crypto';
import { CardService } from '../../../Core/useraccount/card/card.service';

@Injectable()
export class NewQrPaymentService {
  private Client: AxiosInstance;

  constructor(
    private readonly accountService: AccountService,
    private readonly userService: UserService,
    private readonly loggerService: LoggercoreService,
    private readonly targetService: PaymentGroupProjectApiService,
    private readonly switchService: SwitchMobileService,
    private readonly voucherService: VoucherCoreService,
    private readonly cardService: CardService
  ) {
    this.Client = axios.create({
      baseURL: 'http://localhost:8001/',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  async pay(cipher, userid, amount): Promise<any> {
    // Split Pattern

    const info = await this.slipterEnc(cipher);
    // decode String
    if (info.mobile == '09363677791') {
      return this.voucherPay(info, cipher, userid, amount);
    } else {
      return this.userPay(info, cipher, userid, amount);
    }
  }

  private async voucherPay(info, cipher, userid, amount): Promise<any> {
    const halfkey = 'MyVouCheR0';
    const merchantInfo = await this.userService.findByUseridAll(userid);

    if (merchantInfo.terminal) {
      return this.voucherGatePay(cipher, userid, amount, info, halfkey, merchantInfo);
    } else {
      return this.voucherUserPayment(cipher, userid, amount, info, halfkey);
    }
  }
  private async voucherGatePay(cipher, userid, amount, info, halfkey, merchantInfo): Promise<any> {
    const dec = await decryptionString(info.enc, halfkey);
    if (isEmpty(dec)) throw new UserCustomException('ee');
    const data = JSON.parse(dec);
    const Info = await this.voucherService.getInfo(data.to);

    let traxAmount = merchantInfo.terminal.strategy[0].to;

    let title = 'خرید از وچر';

    if (Info.percent && Info.percent > 0) {
      const discountx = Math.round((Info.percent * merchantInfo.terminal.strategy[0].to) / 100);
      title = 'خرید از وچر با ' + Info.percent + ' تخفیف';
      traxAmount = merchantInfo.terminal.strategy[0].to - discountx;
    }

    const div = Info.amount / traxAmount;

    const money = Math.floor(Info.amount / traxAmount);
    if (money < 1) throw new UserCustomException('بلیط غیر مجاز می باشد');

    let person = 0;
    for (let i = 0; money > i; i++) {
      if (Info.amount < traxAmount) throw new notEnoughMoneyException();
      const res = await this.voucherService.decrease(data.to, traxAmount);
      if (!res) throw new InternalServerErrorException();
      let mobile;
      if (!Info.mobile) {
        mobile = 0;
      } else {
        mobile = Info.mobile;
      }
      const logInfo = await this.accountService.accountSetLogg(
        title,
        'Voucher',
        traxAmount,
        true,
        null,
        merchantInfo.terminal.merchant.user,
        mobile
      );
      await this.accountService.chargeAccount(merchantInfo.terminal.merchant.user, 'wallet', traxAmount);
      person++;
    }

    return {
      success: true,
      message: person + 'نفر مجاز است',
      status: 200,
      ref: 'Ok',
    };
  }

  private async voucherUserPayment(cipher, userid, amount, info, halfkey): Promise<any> {
    const dec = await decryptionString(info.enc, halfkey);
    if (isEmpty(dec)) throw new UserCustomException('ee');
    const data = JSON.parse(dec);
    const Info = await this.voucherService.getInfo(data.to);

    // if (Info.amount < amount) throw new notEnoughMoneyException();
    const groupInfo = await this.targetService.paymentTicket(userid, data.to);

    const res = await this.voucherService.decrease(data.to, groupInfo.total);
    if (!res) throw new InternalServerErrorException();

    let mobile;
    if (!Info.mobile) {
      mobile = 0;
    } else {
      mobile = Info.mobile;
    }
    const title =
      'خرید از وچر' +
      Info.ref +
      ' مبلغ کل : ' +
      groupInfo.amount * groupInfo.qty +
      ' با  ' +
      groupInfo.discount +
      ' درصد تخفیف';
    const logInfo = await this.accountService.accountSetLoggWithRef(
      title,
      Info.ref,
      groupInfo.total,
      true,
      null,
      userid,
      mobile
    );
    await this.accountService.chargeAccount(userid, 'wallet', groupInfo.total);

    return successOptWithDataNoValidation(logInfo.ref);
  }

  private async userPay(info, cipher, userid, amount): Promise<any> {
    // get User Information
    const userInfo = await this.userService.findByMobile(info.mobile);
    const merchantInfo = await this.userService.findByUseridAll(userid);
    const cardInfo = await this.cardService.getCardByUserID(userInfo._id);
    if (cardInfo.status != null && cardInfo.status === false) throw new BadRequestException('کارت غیرفعال است');
    if (!userInfo) throw new UserNotfoundException();

    const dec = await decryptionString(info.enc, userInfo.hek);
    console.log('dec:::::::::::::', info.enc, userInfo.hek, dec);
    if (isEmpty(dec)) throw new UserCustomException('ee');

    const mac = getMacAddress(userInfo.hmac);
    const data = JSON.parse(dec);
    // check Mac Address
    if (mac != data.u) throw new UserCustomException('خرید معتبر نمی باشد', false, 500);
    // Check Duration
    if (timeDuration(data.ti) > 45) throw new UserCustomException('شناسه پرداخت منقضی شده است', false, 500);

    if (merchantInfo.terminal) {
      return this.switchService.Buy(merchantInfo, userInfo, amount);
    } else {
      return this.payQR(userInfo, amount, userid);
    }
  }

  async slipterEnc(enc: string): Promise<any> {
    return {
      mobile: enc.substr(0, 11),
      enc: enc.substr(11),
    };
  }

  private async payQR(userInfo, amount, userid): Promise<any> {
    const wallet = await this.accountService.getBalance(userInfo._id, 'wallet');
    if (wallet.balance < amount) throw new notEnoughMoneyException();
    this.accountService.dechargeAccount(userInfo._id, 'wallet', amount);
    this.accountService.chargeAccount(userid, 'wallet', amount);
    const title = 'خرید از ' + userInfo.fullname;
    const logInfo = await this.loggerService.submitNewLogg(title, 'Pay', amount, true, userInfo._id, userid);
    sendNotif(userInfo.fcm, amount);
    return successOptWithDataNoValidation(logInfo.ref);
  }

  async getRemain(barcode: string, userid: string): Promise<any> {
    const info = await this.slipterEnc(barcode);
    const halfkey = 'MyVouCheR0';

    const dec = await decryptionString(info.enc, halfkey);

    if (isEmpty(dec)) throw new UserCustomException('ووچر نامعتبر');
    const data = JSON.parse(dec);
    const Info = await this.voucherService.getInfo(data.to);

    const groupInfo = await this.targetService.getInfo(userid, data.to);

    if (!Info) throw new UserCustomException('وچر یافت نشد', false, 404);
    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      amount: groupInfo,
    };
  }

  async decryptor(cipher: string, key: string): Promise<any> {
    const query = qs.stringify({
      cipher: cipher,
      key: key,
    });
    console.log(query);
    const { data } = await this.Client.post('/api/v1/dec', query);
    console.log(data);
    if (data.status != 200) throw new InternalServerErrorException();
    return data.message;
  }
}
