import { Injectable, CreditStatusEnums, successOpt, CoBenefit } from '@vision/common';
import { AccountService } from '../../useraccount/account/account.service';
import { creditCalc } from '@vision/common/utils/credit-calc.util';
import * as moment from 'jalali-moment';
import { getDate } from '@vision/common/utils/month-diff.util';
import { UserCreditCoreService } from '../../credit/usercredit/credit-core.service';
const roundTo = require('round-to');

@Injectable()
export class PayCreditService {
  constructor(
    private readonly accountService: AccountService,
    private readonly userCreditService: UserCreditCoreService
  ) {}

  private async Mozarebe(
    amount,
    month,
    benefit,
    freemonth,
    type,
    prepayment,
    userid,
    merchanttype,
    balanceinStore
  ): Promise<any> {
    let installAmount: number;
    let returnData: boolean;
    let prepaid = 0;
    let sumCredit = 0;
    let sumAmount = 0;
    let MozarebeSum = 0;
    let OrginalInstall = Array();
    let MozarebeTotal = {
      amount: 0,
      title: '',
    };
    let installs = Array();

    const accountBalance = await this.userCreditService.getCreditBalance(userid);
    let walletBalance = accountBalance[0].balance;
    // check prepayment
    if (prepayment > 0 && balanceinStore > 0) {
      amount = amount - balanceinStore;
      const pre = Math.round((prepayment * amount) / 100);
      installAmount = amount - pre;
    } else {
      installAmount = amount;
    }

    walletBalance = walletBalance - prepayment;

    const data = creditCalc(installAmount, month, benefit, freemonth, type);
    sumAmount = prepayment;
    const lenMin = data.length - 1;
    installs.push(this.setTicketType(merchanttype, month));
    for (let i = 0, len = data.length; i < len; i++) {
      const date = getDate(new Date(data[i].date).getTime());
      const check = await this.userCreditService.getUserCredit(userid, date);
      if (check) {
        if (check.amount < data[i].amount) {
          let mod = 0;
          if (check.amount > 0) {
            mod = data[i].amount - check.amount;
          } else {
            mod = data[i].amount;
          }
          if (walletBalance > mod) {
            sumAmount = sumAmount + mod;
            walletBalance = walletBalance - mod;
            if (i === lenMin) {
              MozarebeTotal.amount = roundTo(MozarebeSum + mod, 2);
              MozarebeTotal.title = data[i].date;
              sumCredit = sumCredit + MozarebeTotal.amount;
              this.userCreditService.singleDechargeUserCredit(userid, data[i].date, MozarebeTotal.amount);
              OrginalInstall.push({ amount: MozarebeTotal.amount, date: data[i].date });
              installs.push(MozarebeTotal);
              returnData = true;
            } else {
              returnData = true;
              MozarebeSum = MozarebeSum + mod;
            }
          } else {
            returnData = false;
          }
        } else {
          if (i === lenMin) {
            MozarebeTotal.amount = roundTo(MozarebeSum + data[i].amount, 2);
            let timex = moment(data[i].date * 1000)
              .locale('fa')
              .format('YYYY/M/D');
            MozarebeTotal.title = timex + ' سررسید  ';
            sumCredit = sumCredit + MozarebeTotal.amount;
            // TODO fix when notEnough Credit Return Error
            this.userCreditService.singleDechargeUserCredit(userid, data[i].date * 1000, MozarebeTotal.amount);
            console.log(' ok last');
            OrginalInstall.push({ amount: MozarebeTotal.amount, date: data[i].date });
            installs.push(MozarebeTotal);
            returnData = true;
          } else {
            returnData = true;
            MozarebeSum = MozarebeSum + data[i].amount;
          }
        }
      } else {
        returnData = false;
      }
    }

    return {
      success: returnData,
      fromWallet: sumAmount,
      prepayment: prepayment,
      sumCredit: sumCredit,
      installsCount: OrginalInstall.length,
      installs: installs,
      data: OrginalInstall,
    };
  }

  private async Credit(
    amount,
    month,
    benefit,
    freemonth,
    type,
    prepayment,
    userid,
    merchanttype,
    balanceinStore
  ): Promise<any> {
    // set variables
    let installs = Array();
    let sumAmount = 0;
    let sumCredit = 0;
    let installAmount: number;
    let OrginalInstall = Array();
    let pre = 0;
    //get wallet BAlance
    const accountBalance = await this.userCreditService.getCreditBalance(userid);
    let walletBalance = accountBalance[0].balance;
    // check prepayment
    if (balanceinStore.amount > 0) {
      amount = amount - balanceinStore.amount;
    }

    if (prepayment > 0) {
      pre = Math.round((prepayment * amount) / 100);
      installAmount = amount - pre;
    } else {
      installAmount = amount;
    }
    if (walletBalance < pre) return { success: false, fromWallet: -1 };
    // calc  prepayment from wallet
    walletBalance = walletBalance - pre;

    const data = creditCalc(installAmount, month, benefit, freemonth, type);
    // set returnData Variable
    let returnData: boolean;

    installs.push(this.setTicketType(merchanttype, month));
    sumAmount = pre;

    // check all monthes
    for (let i = 0, len = data.length; i < len; i++) {
      // set months to shamsi
      let timex = moment(data[i].date * 1000)
        .locale('fa')
        .format('YYYY/M/D');
      // set date to search in
      const date = getDate(new Date(data[i].date).getTime());

      // check user have a credit in this month
      const check = await this.userCreditService.getUserCredit(userid, date);

      // condition to use have a credit
      if (check) {
        if (check.amount < data[i].amount) {
          // check If check.amount is negative set zero to start
          let mod = 0;
          if (check.amount > 0) {
            mod = data[i].amount - check.amount;
          } else {
            mod = data[i].amount;
          }
          if (walletBalance > mod) {
            sumAmount = sumAmount + mod;
            walletBalance = walletBalance - mod;
            const primaryBenefit = Math.round((CoBenefit.PrimaryBenefit * mod) / 100);
            const finalAmount = primaryBenefit + mod;
            OrginalInstall.push({ amount: finalAmount, date: data[i].date });
            installs.push({ amount: finalAmount.toLocaleString(), title: timex + ' سررسید ' });
            sumCredit = sumCredit + finalAmount;
            this.userCreditService.singleDechargeUserCredit(userid, date, finalAmount);
            returnData = true;
          } else {
            returnData = false;
          }
        } else {
          const primaryBenefit = Math.round((CoBenefit.PrimaryBenefit * data[i].amount) / 100);
          const finalAmount = primaryBenefit + data[i].amount;
          OrginalInstall.push({ amount: finalAmount, date: data[i].date });
          installs.push({ amount: finalAmount.toLocaleString(), title: timex + ' سررسید ' });
          this.userCreditService.singleDechargeUserCredit(userid, date, finalAmount);
          sumCredit = sumCredit + finalAmount;
          returnData = true;
        }
      } else {
        returnData = false;
      }
    }

    const datax = {
      success: returnData,
      balanceinStore: balanceinStore.amount,
      fromWallet: sumAmount,
      prepayment: pre,
      installsCount: OrginalInstall.length,
      installs: installs,
      sumCredit: sumCredit,
      data: OrginalInstall,
    };
    return datax;
  }

  async creditCalc(
    amount,
    month,
    benefit,
    freemonth,
    type,
    prepayment,
    userid,
    merchanttype,
    balanceinStore
  ): Promise<any> {
    if (merchanttype === CreditStatusEnums.MOZAREBEH) {
      return this.Mozarebe(amount, month, benefit, freemonth, type, prepayment, userid, merchanttype, balanceinStore);
    } else {
      return this.Credit(amount, month, benefit, freemonth, type, prepayment, userid, merchanttype, balanceinStore);
    }
  }

  private setTicketType(type, month) {
    if (type === CreditStatusEnums.CREDIT) {
      return { title: 'خرید اعتباری' };
    }
    if (type === CreditStatusEnums.INSTALLMENTS_CREDIT) {
      return { title: 'تعداد اقساط', amount: month };
    }
    if (type === CreditStatusEnums.MOZAREBEH) {
      return { title: ' سر رسید پرداخت ' + month + ' ماه دیگر' };
    }
  }
}
