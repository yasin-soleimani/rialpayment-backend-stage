import { CreditChargeStatusEnums, Injectable } from '@vision/common';
import { MerchantCoreTerminalBalanceService } from '../../../../Core/merchant/services/merchant-terminal-balance.service';
import { MerchantCreditCoreService } from '../../../../Core/credit/merchantcredit/merchantcredit.service';
import { SwitchCommonCreditComponent } from './component/common.component';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { AccountService } from '../../../../Core/useraccount/account/account.service';
import { UserCreditCoreService } from '../../../../Core/credit/usercredit/credit-core.service';
import { PayCommonService } from '../../../../Core/pay/services/pay-common.service';
import { discountPercent } from '@vision/common/utils/load-package.util';

@Injectable()
export class SwitchNewCreditService {
  private balanceInTerminal = 0;
  constructor(
    private readonly balanceInStoreService: MerchantCoreTerminalBalanceService,
    private readonly merchantCreditService: MerchantCreditCoreService,
    private readonly commonService: SwitchCommonCreditComponent,
    private readonly accountService: AccountService,
    private readonly userCreditService: UserCreditCoreService,
    private readonly payCommonService: PayCommonService
  ) {}

  async Payment(getInfo, cardInfo, terminalInfo): Promise<any> {
    let balanceinstore = await this.balanceInStoreService.getBalanceInStore(terminalInfo._id, cardInfo.user._id);
    if (!isEmpty(balanceinstore)) this.balanceInTerminal = balanceinstore[0].amount;
    if (balanceinstore.amount >= getInfo.TrnAmt) return false;
    // get Merchant Credit Strategy
    const merchantCreditInfo = await this.merchantCreditService.getTerminalCreditInfo(terminalInfo._id);

    const data = await this.commonService.selector(
      merchantCreditInfo.type,
      getInfo.TrnAmt,
      merchantCreditInfo.advance.qty,
      merchantCreditInfo.advance.benefit,
      merchantCreditInfo.advance.freemonths,
      CreditChargeStatusEnums.Transferable,
      merchantCreditInfo.advance.prepayment,
      cardInfo.user._id,
      this.balanceInTerminal,
      terminalInfo
    );
    if (!data || data.success === false || data === false) return false;

    for (const deInfo of data.data) {
      await this.userCreditService.singleDechargeWithDate(deInfo.id, Number(deInfo.amount));
      await this.userCreditService.signleChargeUserCredit(
        terminalInfo.user._id,
        deInfo.amount,
        deInfo.date,
        CreditChargeStatusEnums.SecondTransfer,
        cardInfo.user._id
      );
    }

    if (data.fromWallet > 0) {
      const disAmount = discountPercent(data.fromWallet, merchantCreditInfo.cobenefit);
      this.accountService.dechargeAccount(cardInfo.user._id, 'wallet', data.fromWallet);
      this.accountService.chargeAccount(terminalInfo.user._id, 'wallet', data.fromWallet);
      const title = 'پرداخت از کیف بابت خرید اعتباری از فروشگاه ' + terminalInfo.title;
      this.accountService.accountSetLogg(
        title,
        'CreditPay-',
        data.fromWallet,
        true,
        cardInfo.user._id,
        terminalInfo.user._id
      );

      if (merchantCreditInfo.cobenefit > 0 && disAmount.discount > 0) {
        const wages = this.calcWage(disAmount.discount, Number(merchantCreditInfo.cobenefit));
        this.accountService.dechargeAccount(terminalInfo.user._id, 'wallet', disAmount.discount);
        const titlex = 'کسر کارمزد خرید اعتباری از فروشگاه ' + terminalInfo.title;
        this.accountService.accountSetLogg(
          titlex,
          'CreditPayWage-',
          disAmount.discount,
          true,
          terminalInfo.user._id,
          null
        );

        this.accountService.chargeAccount(cardInfo.user.ref, 'wallet', wages.cardwage);
        const titlez = 'هزینه ثبت کاربر بابت خرید اعتباری از فروشگاه' + terminalInfo.title;
        this.accountService.accountSetLogg(titlez, 'CardWage-', wages.cardwage, true, terminalInfo.user._id, null);

        this.accountService.chargeAccount(cardInfo.user.ref, 'wallet', wages.merchantWage);
        const titlec = 'هزینه ثبت پذیرنده بابت خرید اعتباری از فروشگاه' + terminalInfo.title;
        this.accountService.accountSetLogg(
          titlec,
          'MerchantWage-',
          wages.merchantWage,
          true,
          terminalInfo.user._id,
          null
        );
      }
    }

    if (data.prepayment > 0) {
      const disAmount = discountPercent(data.fromWallet, merchantCreditInfo.cobenefit);

      this.accountService.dechargeAccount(cardInfo.user._id, 'wallet', data.prepayment);
      this.accountService.chargeAccount(terminalInfo.user._id, 'wallet', data.prepayment);
      const title = 'پیش پرداخت خرید اعتباری  از فروشگاه ' + terminalInfo.title;
      this.accountService.accountSetLogg(
        title,
        'CreditPay-',
        data.prepayment,
        true,
        cardInfo.user._id,
        terminalInfo.user._id
      );

      if (merchantCreditInfo.cobenefit > 0 && disAmount.discount > 0) {
        const wages = this.calcWage(disAmount.discount, Number(merchantCreditInfo.cobenefit));
        this.accountService.dechargeAccount(terminalInfo.user._id, 'wallet', disAmount.discount);
        const titlex = 'کسر کارمزد خرید اعتباری از فروشگاه ' + terminalInfo.title;
        this.accountService.accountSetLogg(
          titlex,
          'CreditPayWage-',
          disAmount.discount,
          true,
          terminalInfo.user._id,
          null
        );

        this.accountService.chargeAccount(cardInfo.user.ref, 'wallet', wages.cardwage);
        const titlez = 'هزینه ثبت کاربر بابت خرید اعتباری از فروشگاه' + terminalInfo.title;
        this.accountService.accountSetLogg(titlez, 'CardWage-', wages.cardwage, true, terminalInfo.user._id, null);

        this.accountService.chargeAccount(cardInfo.user.ref, 'wallet', wages.merchantWage);
        const titlec = 'هزینه ثبت پذیرنده بابت خرید اعتباری از فروشگاه' + terminalInfo.title;
        this.accountService.accountSetLogg(
          titlec,
          'MerchantWage-',
          wages.merchantWage,
          true,
          terminalInfo.user._id,
          null
        );
      }
    }

    const listPrint = await this.getCalcStatus(data, cardInfo);
    const dataPrint = listPrint.concat(data.installs);
    const returnData = this.payCommonService.setDataCloseLoop(getInfo, dataPrint, null, null, 20);
    const logInfo = await this.setLogg(
      terminalInfo.title,
      data.sumCredit,
      cardInfo.user._id,
      terminalInfo.merchant.user
    );
    this.payCommonService
      .submitCreditRequest(
        cardInfo.user._id,
        terminalInfo.merchant.user,
        terminalInfo._id,
        getInfo.TrnAmt,
        data.prepayment,
        data.data,
        merchantCreditInfo.advance,
        merchantCreditInfo.type,
        0,
        merchantCreditInfo.tenday,
        merchantCreditInfo.tnyday,
        data.installsCount,
        true
      )
      .then((value) => {
        this.payCommonService
          .submitRequest(getInfo, listPrint, null)
          .then((res2) => {
            this.payCommonService
              .submitMainRequest(
                cardInfo.user._id,
                cardInfo.user.ref,
                terminalInfo.merchant._id,
                terminalInfo.merchant.ref,
                terminalInfo._id,
                getInfo,
                balanceinstore.amount,
                res2._id,
                returnData,
                merchantCreditInfo.type,
                logInfo,
                null,
                null
              )
              .catch((erro) => console.log('erro', erro));
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((err) => {
        console.log('main', err);
      });
    return returnData;
  }

  private async getCalcStatus(data, cardInfo): Promise<any> {
    // set variable (Array) to print
    let listPrint = Array();
    if (data.balanceinStore > 0) {
      listPrint.push({ title: ' کسر از اعتبار در فروشگاه', amount: Math.round(data.balanceinStore) });
    } else {
      listPrint.push({ title: ' کسر از اعتبار در فروشگاه', amount: 0 });
    }
    // cehck mechant prepayment
    if (data.prepayment > 0) {
      listPrint.push({ title: ' پیش پرداخت', amount: Math.round(data.prepayment) });
    } else {
      listPrint.push({ title: ' پیش پرداخت', amount: 0 });
    }
    if (data.fromWallet > 0) {
      listPrint.push({ title: ' کسر از کیف پول', amount: Math.round(data.fromWallet) });
    } else {
      listPrint.push({ title: ' کسر از کیف پول', amount: 0 });
    }
    // get users credit
    const totalCredit = await this.userCreditService.getCreditBalance(cardInfo.user._id);
    // push to list print
    listPrint.push({ title: 'مانده اعتبار', amount: Math.floor(totalCredit[0].balance) });
    // set variable (Array) to print
    return listPrint;
  }

  private async setLogg(titlex, sumCredit, cardUser, merchantUser): Promise<any> {
    const title = 'خرید اعتباری از فروشگاه ' + titlex;
    return this.accountService.accountSetLogg(title, 'CreditPay', Math.ceil(sumCredit), true, cardUser, merchantUser);
  }

  private calcWage(amount, percent) {
    const cardWage = Math.round((percent * amount) / 15) || 0;
    const merchantWage = Math.round((percent * amount) / 35) || 0;
    const wageTotal = cardWage + merchantWage;
    return {
      cardwage: cardWage,
      merchantWage: merchantWage,
      company: amount - wageTotal,
    };
  }
}
