import { Model } from 'mongoose';
import { Injectable, Inject, InternalServerErrorException, successOpt } from '@vision/common';
import { CheckoutSubmitCoreDto } from './dto/checkoutsubmit.dto';
import { AccountService } from '../../useraccount/account/account.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { CheckoutCoreService } from '../checkout/checkoutcore.service';
import axios, { AxiosInstance } from 'axios';
import { UserService } from '../../useraccount/user/user.service';
import { notEnoughMoneyException } from '@vision/common/exceptions/notEnoughMoney.exception';
import { LoggercoreService } from '../../logger/loggercore.service';
import * as UniqueNumber from 'unique-number';
import { hourDiff, trasnTime } from '@vision/common/utils/month-diff.util';
import { SystemMessages } from '@vision/common/enums/system-messages.enum';
import { isNullOrUndefined } from 'util';

@Injectable()
export class CheckoutSubmitCoreService {
  private client: AxiosInstance;
  constructor(
    @Inject('SubmitModel') private readonly submitModel: Model<any>,
    private readonly accountService: AccountService,
    private readonly checkoutService: CheckoutCoreService,
    private readonly userService: UserService,
    private readonly loggerService: LoggercoreService
  ) {
    this.client = axios.create({
      baseURL: 'http://185.105.185.130:8082/icc/',
    });
  }

  private async create(getInfo: CheckoutSubmitCoreDto): Promise<any> {
    const insertCheckout = new this.submitModel(getInfo);
    return await insertCheckout.save();
  }

  private async test(): Promise<any> {
    return this.submitModel.find({}).populate('user');
  }

  async getLast(userid): Promise<any> {
    const checkoutData = await this.submitModel.findOne({ user: userid }).sort({ createdAt: -1 });
    return checkoutData;
  }

  async submitCheckout(getInfo: CheckoutSubmitCoreDto): Promise<any> {
    await this.getTransTime();

    if (getInfo.amount > SystemMessages.Maximum_Amount)
      throw new UserCustomException(
        'حداکثر مبلغ تسویه ' + SystemMessages.Maximum_Amount + '  ریال می باشد',
        false,
        303
      );
    const lastTransData = await this.getLast(getInfo.user);
    if (lastTransData) {
      await this.hoursDiff(lastTransData.createdAt);
    }

    await this.checkAmount(getInfo);
    const checkout = await this.checkoutService.getInfo(getInfo.account, getInfo.user);
    if (!checkout) throw new UserCustomException('شماره حساب شما در سیستم یافت نشد', false, 701);

    const user = await this.userService.findUserAll(getInfo.user);
    if (!user) throw new UserCustomException('کاربر یافت نشد');
    if (!isNullOrUndefined(user.checkout) && user.checkout == false)
      throw new UserCustomException('شما مجاز به تسویه حساب نیستید با پشتیبانی تمای بگیرید', false, 500);
    this.checkBalance(user, getInfo.amount);
    getInfo.checkout = checkout._id;
    const submit = await this.create(getInfo);
    if (!submit) throw new UserCustomException('مشکلی پیش آمده است دوباره سعی کنید', false, 500);

    const bankname = await this.selectBank(checkout.bankname);
    const getBalance = await this.accountService.getBalance(getInfo.user, 'wallet');
    if (getBalance.balance < getInfo.amount) throw new UserCustomException('موجودی کافی نمی باشد', false, 404);
    await this.accountService.dechargeAccount(getInfo.user, 'wallet', getInfo.amount);

    if (bankname) {
      if (checkout.type === 1) {
        this.intertnalTransfer(bankname, checkout, getInfo, user, submit._id);
      } else {
        // this.accountService.chargeAccount(getInfo.user, 'wallet', getInfo.amount);
        throw new UserCustomException('متاسفانه تسویه حساب با خطا مواجه شده است');
      }
    } else {
      if (checkout.type === 2) {
        this.shebaTransfer(checkout, getInfo, user, submit._id);
      } else {
        // this.accountService.chargeAccount(getInfo.user, 'wallet', getInfo.amount);
        throw new UserCustomException('متاسفانه تسویه حساب با خطا مواجه شده است');
      }
    }
    return successOpt();
  }

  private async isSheba(bank, sheba, amountx, name, lastname, nin, descriptionx): Promise<any> {
    const data = await this.bankcheckout(bank, '', sheba, amountx, name, lastname, nin, descriptionx, false);
    if (!data) throw new UserCustomException('متاسفانه خطایی رخ داده است', false, 500);
    if (data.status == 200) {
      return {
        status: true,
        data: JSON.stringify(data),
      };
    } else {
      return {
        status: false,
        data: JSON.stringify(data),
      };
    }
  }

  private async hoursDiff(date): Promise<any> {
    const diffData = hourDiff(date);
    if (diffData < 3) throw new UserCustomException(' هر ۳ ساعت یکبار می توانید درخواست تسویه داشته باشید', false, 701);
  }

  private getTransTime() {
    if (!trasnTime())
      throw new UserCustomException('شما می توانید بین ساعت 7:30 الی 14:30 درخواست تسویه کنید', false, 701);
  }
  private async isInternal(bank, acc, amountx, name, lastname, nin, descriptionx): Promise<any> {
    const data = await this.bankcheckout(bank, acc, '', amountx, name, lastname, nin, descriptionx, true);
    if (!data) throw new UserCustomException('متاسفانه خطایی رخ داده است', false, 500);
    if (data.status == 200) {
      return {
        status: true,
        data: JSON.stringify(data),
      };
    } else {
      return {
        status: false,
        data: JSON.stringify(data),
      };
    }
  }

  private selectBank(accInfo) {
    const n = accInfo.search('سپه');
    if (n > 0) {
      return 'sepah';
    }
    const x = accInfo.search('کشاورزی');
    if (x > 0) {
      return 'agri';
    }
    return false;
  }
  private async checkAmount(getInfo: CheckoutSubmitCoreDto): Promise<any> {
    if (isEmpty(getInfo.amount) || isEmpty(getInfo.account)) throw new FillFieldsException();
    const account = await this.accountService.getWallet(getInfo.user);
    if (getInfo.amount > account.balance) throw new UserCustomException('موجودی ناکافی', false, 701);
  }

  private async bankcheckout(bank, dest, sheba, amountx, name, lastname, nin, descriptionx, internal): Promise<any> {
    const args = {
      user: 'icc-Transfer_NOCr-1',
      pass: ',=%XX$$G.X?a}-$]W4m4Lfydeh=)QpK4$:_-2',
      sourcebank: bank,
      isiternaltransfer: internal,
      destinationaccount: dest,
      destinationsheba: sheba,
      amount: amountx,
      destinationname: name,
      destinationfamily: lastname,
      destinationnationalcode: nin,
      description: descriptionx,
    };

    console.log(args);
    const ttttt = await this.client.post('transfer', args);
    console.log(ttttt);
    return ttttt.data;
  }

  private async intertnalTransfer(bankname, checkout, getInfo, user, submitid): Promise<any> {
    this.isInternal(
      bankname,
      checkout.account,
      getInfo.amount,
      user.fullname,
      user.fullname,
      user.nationalcode,
      'انتقال وجه' + user.fullname
    )
      .then((value) => {
        if (value.status === true) {
          const title = 'درخواست تسویه به حساب ' + checkout.account + ' بانک ' + checkout.bankname;
          const uniqueNumber = new UniqueNumber(true);
          const ref = 'Checkout-' + uniqueNumber.generate();

          const newlog = this.loggerService.setLogg(title, ref, getInfo.amount, 1, getInfo.user, getInfo.user);
          this.loggerService.newLogg(newlog);

          this.submitModel.findOneAndUpdate({ _id: submitid }, { data: value.data });
        } else {
          // this.accountService.chargeAccount(getInfo.user, 'wallet', getInfo.amount);
          this.submitModel.findOneAndUpdate({ _id: submitid }, { data: value.data });
          throw new UserCustomException('متاسفانه تسویه حساب با خطا مواجه شده است');
        }
      })
      .catch((err) => {
        if (err) {
          const data = JSON.stringify(err);
          this.submitModel.findOneAndUpdate({ _id: submitid }, { data: data });
          // this.accountService.chargeAccount(getInfo.user, 'wallet', getInfo.amount);
          throw new UserCustomException('متاسفانه تسویه حساب با خطا مواجه شده است');
        }
      });
  }

  private async shebaTransfer(checkout, getInfo, user, submitid): Promise<any> {
    this.isSheba(
      'sepah',
      checkout.account,
      getInfo.amount,
      user.fullname,
      user.fullname,
      user.nationalcode,
      'انتقال وجه' + user.fullname
    )
      .then((value) => {
        if (value.status === true) {
          const title = 'درخواست تسویه به شماره شبا ' + checkout.account;
          const uniqueNumber = new UniqueNumber(true);
          const ref = 'Checkout-' + uniqueNumber.generate();

          const newlog = this.loggerService.setLogg(title, ref, getInfo.amount, 1, getInfo.user, getInfo.user);
          this.loggerService.newLogg(newlog);

          this.submitModel.findOneAndUpdate({ _id: submitid }, { data: value.data });
        } else {
          // this.accountService.chargeAccount(getInfo.user, 'wallet', getInfo.amount);
          this.submitModel.findOneAndUpdate({ _id: submitid }, { data: value.data });
          throw new UserCustomException('متاسفانه تسویه حساب با خطا مواجه شده است');
        }
      })
      .catch((err) => {
        const data = JSON.stringify(err);
        this.submitModel.findOneAndUpdate({ _id: submitid }, { data: data });
        // this.accountService.chargeAccount(getInfo.user, 'wallet', getInfo.amount);
        throw new UserCustomException('متاسفانه تسویه حساب با خطا مواجه شده است');
      });
  }

  static successOpt() {
    return {
      success: true,
      status: 200,
      message: 'عملیات با موفقیت انجام شد',
    };
  }

  private getWallet(user: any) {
    for (const index in user.accounts) {
      if (user.accounts[index].type === 'wallet') {
        return index;
      }
    }
  }

  private checkBalance(user, amount) {
    const wallet = this.getWallet(user);
    if (user.accounts[wallet].balance < amount) throw new notEnoughMoneyException();
  }
}
