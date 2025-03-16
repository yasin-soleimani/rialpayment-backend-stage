import { CoBenefit, Injectable } from '@vision/common';
import { AccountService } from '../../../../../Core/useraccount/account/account.service';
import { addMonthJalali, addMonthJalaliTimestamp } from '@vision/common/utils/month-diff.util';
import { UserCreditCoreService } from '../../../../../Core/credit/usercredit/credit-core.service';
import * as moment from 'jalali-moment';
import { setTicketType } from '../function/common.func';
import { round } from '@vision/common/utils/round.util';
import { timeConvertCredit } from '../function/date.func';
const roundTo = require('round-to');

@Injectable()
export class SwitchCreditCalcComponent {
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
    private readonly accountService: AccountService,
    private readonly userCreditService: UserCreditCoreService
  ) {}

  async equal(amount, month, benefit, freemonth, type, prepayment, userid, balanceinStore, terminalInfo): Promise<any> {
    this.clear();
    this.sumCredit = amount;

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

    const accountBalance = await this.accountService.getBalance(userid, 'wallet');
    if (this.prepaid > 0 && accountBalance.balance < this.prepaid) {
      this.returnData = false;
      return false;
    }
    this.totalAmount = this.prepaid;

    this.installs.push(setTicketType(type, month));
    await this.creditInstalls(userid, month, benefit);
    return this.returnModel();
  }

  private async creditInstalls(userid, month, benefit): Promise<any> {
    this.sumCredit = roundTo(this.sumCredit / month, 1);
    let creditMonth = moment().locale('fa').unix() * 1000;
    for (let i = 0; i < month; i++) {
      if (i > 0) {
        creditMonth = addMonthJalaliTimestamp(i);
      }
      console.log(creditMonth, 'credit MOnth');
      const creditBalance = await this.userCreditService.getUserCredit(userid, creditMonth);
      console.log(creditBalance, 'creditBalance');

      if (creditBalance.amount < 100) return false;
      if (!creditBalance) return false;

      switch (true) {
        case creditBalance.amount >= this.sumCredit: {
          await this.allCredit(userid, creditMonth, creditBalance, benefit);
          break;
        }
        case creditBalance.amount < this.sumCredit && creditBalance.amount > 100: {
          await this.walletCredit(userid, creditMonth, creditBalance, benefit);
          break;
        }

        default: {
          return false;
          break;
        }
      }
    }
  }

  private async allCredit(userid, date, creditBalance, benefit): Promise<any> {
    let timex = timeConvertCredit(date);
    this.installs.push({
      amount: Number(this.calcMerchantBenefit(Number(this.sumCredit), Number(benefit))),
      title: 'سررسید' + timex.fullDate,
    });
    this.originalInstall.push({
      id: creditBalance._id,
      date: timex.unix,
      amount: Number(this.calcMerchantBenefit(Number(this.sumCredit), Number(benefit))),
    });
    this.returnData = true;
  }

  private async walletCredit(userid, date, creditBalance, benefit): Promise<any> {
    const sumAmount = this.sumCredit - creditBalance.amount;
    this.sumAmount = this.sumAmount + sumAmount;
    this.totalAmount = this.totalAmount + sumAmount;

    const accountBalance = await this.accountService.getBalance(userid, 'wallet');

    if (this.totalAmount > 0 && accountBalance.balance < this.totalAmount) {
      this.returnData = false;
      return false;
    }

    this.sumCredit = this.sumCredit - this.totalAmount;
    let timex = timeConvertCredit(date);
    this.installs.push({
      amount: Number(this.calcMerchantBenefit(Number(this.sumCredit), Number(benefit))),
      title: 'سررسید' + timex.fullDate,
    });
    this.originalInstall.push({
      id: creditBalance._id,
      date: timex.unix,
      amount: Number(this.calcMerchantBenefit(Number(this.sumCredit), Number(benefit))),
    });
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
