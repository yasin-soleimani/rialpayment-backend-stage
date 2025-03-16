import { Injectable } from '@vision/common';
import { getMonthForward } from '@vision/common/utils/month-diff.util';
import { UserCreditCoreService } from '../../../../../Core/credit/usercredit/credit-core.service';
import { AccountService } from '../../../../../Core/useraccount/account/account.service';
const roundTo = require('round-to');
import * as moment from 'jalali-moment';
import { setTicketType } from '../function/common.func';
import { timeConvertCredit } from '../function/date.func';

@Injectable()
export class SwitchCreditCalcMozarebeCalcComponent {
  private installamount = 0;
  private returnData = false;
  private prepaid = 0;
  private sumCredit = 0;
  private totalAmount = 0;
  private sumAmount = 0;
  private balanceInStore = 0;
  private originalInstall = Array();
  private installs = Array();

  constructor(
    private readonly userCreditService: UserCreditCoreService,
    private readonly accountService: AccountService
  ) {}

  async equal(amount, month, benefit, freemonth, type, prepayment, userid, balanceinStore, terminalInfo): Promise<any> {
    this.clear();
    this.sumCredit = amount;

    const creditMonth = getMonthForward(month);
    const creditBalance = await this.userCreditService.getUserCredit(userid, creditMonth * 1000);

    if (!creditBalance) return false;
    if (creditBalance.amount < 10) return false;

    if (balanceinStore > 0) {
      if (balanceinStore > this.sumCredit) {
        return false;
      } else {
        this.sumCredit = this.sumCredit - this.balanceInStore;
        this.balanceInStore = balanceinStore;
      }
    }

    if (prepayment > 0) {
      const pre = roundTo((this.sumCredit * prepayment) / 100, 2);
      this.sumCredit = this.sumCredit - pre;
      this.prepaid = pre;
    }
    switch (true) {
      case creditBalance.amount >= this.sumCredit: {
        await this.allCredit(userid, creditMonth, terminalInfo, creditBalance, type, month);
        break;
      }
      case creditBalance.amount < this.sumCredit && creditBalance.amount > 100: {
        await this.walletCredit(userid, creditMonth, terminalInfo, creditBalance, type, month);
        break;
      }

      default: {
        return false;
        break;
      }
    }
    return this.returnModel();
  }

  // From Credit Only
  private async allCredit(userid, date, terminalInfo, creditBalance, type, month): Promise<any> {
    const accountBalance = await this.accountService.getBalance(userid, 'wallet');
    if (this.prepaid > 0 && accountBalance.balance < this.prepaid) {
      this.returnData = false;
      return false;
    }
    let timex = timeConvertCredit(date * 1000);
    this.installs.push({ amount: this.sumCredit, title: 'سررسید' + timex.fullDate });
    this.installs.push(setTicketType(type, month));
    this.originalInstall.push({ id: creditBalance._id, date: timex.unix, amount: this.sumCredit });
    this.returnData = true;
  }

  // From Credit & Wallet
  private async walletCredit(userid, date, terminalInfo, creditBalance, type, month): Promise<any> {
    this.sumAmount = this.sumCredit - creditBalance.amount;
    this.totalAmount = this.sumAmount + this.prepaid;

    const accountBalance = await this.accountService.getBalance(userid, 'wallet');

    if (this.totalAmount > 0 && accountBalance.balance < this.totalAmount) {
      this.returnData = false;
      return false;
    }
    if (this.totalAmount > 0) {
      this.sumCredit = this.sumCredit - this.totalAmount;
    }
    let timex = timeConvertCredit(date * 1000);
    // await this.userCreditService.singleDechargeUserCredit( userid, date * 1000, this.sumCredit );
    this.installs.push({ amount: Number(this.sumCredit), title: 'سررسید' + timex.fullDate });
    this.installs.push(setTicketType(type, month));
    this.originalInstall.push({ id: creditBalance._id, date: timex.unix, amount: Number(this.sumCredit) });
    this.returnData = true;
  }

  private returnModel() {
    return {
      success: this.returnData,
      fromWallet: Number(this.sumAmount),
      prepayment: Number(this.prepaid),
      sumCredit: Number(this.sumCredit),
      installsCount: Number(this.originalInstall.length),
      installs: this.installs,
      balanceinstore: Number(this.balanceInStore),
      data: this.originalInstall,
    };
  }
  private clear() {
    this.installamount = 0;
    this.returnData = false;
    this.prepaid = 0;
    this.sumCredit = 0;
    this.totalAmount = 0;
    this.sumAmount = 0;
    this.balanceInStore = 0;
    this.originalInstall = [];
    this.installs = [];
  }

  private calcMerchantBenefit(amount, percent) {
    const benefit = roundTo((percent * amount) / 100, 1);
    return amount + benefit;
  }
}
