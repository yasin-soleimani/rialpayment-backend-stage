import { Injectable, Inject } from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { hourDiff, minuteDiff, todayRange, trasnTime } from '@vision/common/utils/month-diff.util';
import { CheckoutSubmitCoreDto } from '../dto/checkoutsubmit.dto';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { AccountService } from '../../../useraccount/account/account.service';
import { checkoutType } from '@vision/common/constants/banks.const';
import { UserService } from '../../../useraccount/user/user.service';
import { isNullOrUndefined } from 'util';
import { notEnoughMoneyException } from '@vision/common/exceptions/notEnoughMoney.exception';
import { UserSettingsService } from '../../../../Core/settings/service/user-settings.service';
import { SettingsService } from '../../../../Core/settings/service/settings.service';
import { AccountBlockService } from '../../../../Core/useraccount/account/services/account-block.service';
import { GroupProjectCoreService } from '../../../../Core/group-project/group-project.service';

@Injectable()
export class CheckoutSubmitCommonService {
  constructor(
    @Inject('SubmitModel') private readonly submitModel: any,
    private readonly userSettingsService: UserSettingsService,
    private readonly globalSettingsService: SettingsService,
    private readonly accountService: AccountService,
    private readonly accountBlockService: AccountBlockService,
    private readonly userService: UserService,
    private readonly groupProjectService: GroupProjectCoreService
  ) {}

  // check common validation
  async commonCheck(getInfo, maxcheckout, minute): Promise<any> {
    await this.getTransTime(minute);
    if (getInfo.amount > maxcheckout)
      throw new UserCustomException('حداکثر مبلغ تسویه ' + maxcheckout + '  ریال می باشد', false, 303);
    const lastTransData = await this.getLast(getInfo.user);
    if (lastTransData) {
      if (lastTransData.data) {
        const json = JSON.parse(lastTransData.data);
        if (json.status == 200) {
          if (lastTransData) {
            await this.hoursDiff(lastTransData.createdAt, minute);
          }
        }
      } else {
        if (lastTransData) {
          await this.hoursDiff(lastTransData.createdAt, minute);
        }
      }
    }

    await this.checkWage(getInfo.user, getInfo.amount);

    await this.checkAmount(getInfo);

    await this.checkoutabl(getInfo.user);

    await this.checkAmount(getInfo);

    await this.checkBanks(getInfo.user);
  }

  // check time between to request
  private async hoursDiff(date, minute): Promise<any> {
    if (minute === 0) return true;
    const diffData = minuteDiff(date);
    const msg = 'شما هر ' + minute + 'دقیقه می توانید درخواست تسویه داشته باشید';
    if (diffData < minute) throw new UserCustomException(msg, false, 701);
  }

  private async checkoutabl(userid): Promise<any> {
    const user = await this.userService.findUserAll(userid);
    if (!user) throw new UserCustomException('کاربر یافت نشد');
    if (!isNullOrUndefined(user.checkout) && user.checkout == false)
      throw new UserCustomException('شما مجاز به تسویه حساب نیستید با پشتیبانی تمای بگیرید', false, 500);
  }

  // check transfer time
  private getTransTime(minute) {
    if (minute === 0) return true;
    if (!trasnTime())
      throw new UserCustomException('شما می توانید بین ساعت 7:30 الی 14:30 درخواست تسویه کنید', false, 701);
  }

  // get last transaction
  async getLast(userid): Promise<any> {
    return this.submitModel.findOne({ user: userid }).sort({ createdAt: -1 });
  }

  selectBank(accInfo) {
    const n = accInfo.search('سپه');
    console.log(accInfo, 'accInfo');
    if (n > 0) {
      return checkoutType.sepah;
    }
    const x = accInfo.search('کشاورزی');
    if (x > 0) {
      return checkoutType.agri;
    }
    return false;
  }

  // check amount
  private async checkAmount(getInfo: CheckoutSubmitCoreDto): Promise<any> {
    if (isEmpty(getInfo.amount) || isEmpty(getInfo.account)) throw new FillFieldsException();
    const account = await this.accountService.getWallet(getInfo.user);
    const todayCharge = await this.accountService.getTodayCharge(getInfo.user);
    const blocked = await this.accountBlockService.getBlock(getInfo.user);
    let todayAmount,
      blockAmount = 0;
    if (!isEmpty(todayCharge)) todayAmount = todayCharge[0].total;
    if (blocked.length > 0) blockAmount = blocked[0].total;
    const cashoutable = account.balance - todayAmount - blockAmount;
    if (getInfo.amount > cashoutable) throw new UserCustomException('موجودی ناکافی', false, 701);
  }

  async submitReq(getInfo, checkout, accountInfoId): Promise<any> {
    getInfo.checkout = checkout._id;
    getInfo.account = checkout.account;
    getInfo.bankname = checkout.bankname;
    getInfo.bankaccount = accountInfoId;
    const submit = await this.create(getInfo);
    if (!submit) throw new UserCustomException('مشکلی پیش آمده است دوباره سعی کنید', false, 500);
    return submit;
  }

  async updateReq(id, data, status): Promise<any> {
    return this.submitModel.findOneAndUpdate({ _id: id }, { data: data, status: status });
  }

  private async create(getInfo: CheckoutSubmitCoreDto): Promise<any> {
    const insertCheckout = new this.submitModel(getInfo);
    return await insertCheckout.save();
  }

  private checkBalance(user, amount) {
    const wallet = this.getWallet(user);
    if (user.accounts[wallet].balance < amount) throw new notEnoughMoneyException();
  }

  private getWallet(user: any) {
    for (const index in user.accounts) {
      if (user.accounts[index].type === 'wallet') {
        return index;
      }
    }
  }

  async getReportAll(from, to, page): Promise<any> {
    return this.submitModel.paginate(
      {
        createdAt: { $gte: from, $lte: to },
      },
      { page, populate: 'user checkout', sort: { createdAt: -1 }, limit: 50 }
    );
  }

  async getReport(query, page): Promise<any> {
    return this.submitModel.paginate(query, { page, populate: 'user checkout', sort: { createdAt: -1 }, limit: 50 });
  }

  async getExport(query): Promise<any> {
    return this.submitModel.find(query).populate('checkout');
  }

  async getReportQueryAll(query, page): Promise<any> {
    return this.submitModel.paginate(query, { page, populate: 'user checkout', sort: { createdAt: -1 }, limit: 50 });
  }

  async getTodatCheckouts(userid: string): Promise<any> {
    const today = todayRange();
    return this.submitModel
      .find({
        status: 200,
        user: userid,
        createdAt: {
          $gte: today.start,
          $lte: today.end,
        },
      })
      .count();
  }

  async checkWage(userid: string, amount: number): Promise<any> {
    let settingsInfo;
    settingsInfo = await this.userSettingsService.getUserSettings(userid);
    if (!settingsInfo) {
      settingsInfo = await this.globalSettingsService.get();
    }

    if (!settingsInfo.cashout || settingsInfo.cashout.status == false) return true;

    const wage = this.calcWage(settingsInfo.cashout.range, amount);
    const wallet = await this.accountService.getBalance(userid, 'wallet');
    const total = Number(amount) + wage;
    if (total > wallet.balance) throw new notEnoughMoneyException();
  }

  async wage(userid: string, amount: number): Promise<any> {
    let settingsInfo;
    settingsInfo = await this.userSettingsService.getUserSettings(userid);
    if (!settingsInfo) {
      settingsInfo = await this.globalSettingsService.get();
    }

    if (!settingsInfo.cashout || settingsInfo.cashout.status == false) return true;

    const wage = this.calcWage(settingsInfo.cashout.range, amount);
    await this.accountService.dechargeAccount(userid, 'wallet', wage).then((res) => {
      this.accountService
        .accountSetLogg('کارمزد خدمات بانکی انتقال وجه', 'CashoutWage', wage, true, userid, null)
        .then((res) => console.log(' wage ok'));
    });
  }

  private calcWage(wageInfo, amount) {
    for (const info of wageInfo) {
      if (amount >= info.from && amount <= info.to) {
        return info.amount;
      }
    }
  }

  private async checkBanks(userid: string): Promise<any> {
    const group = await this.groupProjectService.getUserInfo(userid);
    if (group.cashoutapi == false) {
      throw new UserCustomException('تسویه شما به صورت خودکار روزانه انجام می گردد');
    }
  }
}
