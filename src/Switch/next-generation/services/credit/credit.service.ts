import { Injectable, CreditChargeStatusEnums } from '@vision/common';
import { MerchantCreditCoreService } from '../../../../Core/credit/merchantcredit/merchantcredit.service';
import { PayCreditService } from '../../../../Core/pay/services/pay-credit.service';
import { PayCommonService } from '../../../../Core/pay/services/pay-common.service';
import { AccountService } from '../../../../Core/useraccount/account/account.service';
import { MerchantCoreTerminalBalanceService } from '../../../../Core/merchant/services/merchant-terminal-balance.service';
import { UserCreditCoreService } from '../../../../Core/credit/usercredit/credit-core.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { SwitchNewCreditService } from './new-credit.service';

@Injectable()
export class SwitchCreditService {
  constructor(
    private readonly merchantCreditService: MerchantCreditCoreService,
    private readonly payCredit: PayCreditService,
    private readonly commonService: PayCommonService,
    private readonly accountService: AccountService,
    private readonly balanceInStoreService: MerchantCoreTerminalBalanceService,
    private readonly userCreditService: UserCreditCoreService,
    private readonly newCreditService: SwitchNewCreditService
  ) {}

  async newCreditPayment(getInfo, cardInfo, terminalInfo): Promise<any> {
    let balanceinstore = await this.balanceInStoreService.getBalanceInStore(terminalInfo._id, cardInfo.user._id);
    if (!balanceinstore) {
      balanceinstore = {
        amount: 0,
      };
    }
    // get Merchant Credit Strategy
    const merchantCreditInfo = await this.merchantCreditService.getTerminalCreditInfo(terminalInfo._id);
    // calc Credit
    const data = await this.payCredit.creditCalc(
      getInfo.TrnAmt,
      merchantCreditInfo.advance.qty,
      merchantCreditInfo.advance.benefit,
      merchantCreditInfo.advance.freemonths,
      CreditChargeStatusEnums.Transferable,
      merchantCreditInfo.advance.prepayment,
      cardInfo.user._id,
      merchantCreditInfo.type,
      balanceinstore
    );

    // check calc credit status
    if (data.success == true) {
      // check user balance in store
      const listPrint = await this.getCalcStatus(data, cardInfo);
      // concat 2 array
      const dataPrint = listPrint.concat(data.installs);
      // set return data to psp
      const returnData = this.commonService.setDataCloseLoop(getInfo, dataPrint, null, null, 20);
      // insert & modify datat in database
      data.data.forEach((value) => {
        this.userCreditService
          .signleChargeUserCredit(
            terminalInfo.merchant.user,
            value.amount,
            value.date,
            CreditChargeStatusEnums.SecondTransfer,
            cardInfo.user._id
          )
          .catch((err) => {
            console.log(err, 'err1');
          });
      });
      // decharge Acconts & Charge Merchant Account
      this.dechargeAccount(
        cardInfo.user._id,
        terminalInfo.merchant.user,
        terminalInfo._id,
        balanceinstore,
        data.sumAmount
      ).catch((err) => {
        console.log('decharge error', err);
      });

      if (data.fromWallet > 1) {
        const modWallet = await this.fromWallet(cardInfo.user._id, terminalInfo.merchant.user, data.fromWallet);
        if (!modWallet) return;
      }

      const logInfo = await this.setLogg(
        terminalInfo.title,
        data.sumCredit,
        cardInfo.user._id,
        terminalInfo.merchant.user
      );
      this.commonService
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
          this.commonService
            .submitRequest(getInfo, listPrint, null)
            .then((res2) => {
              this.commonService
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
                  value,
                  null,
                  logInfo._id
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
    } else if (data.success == false) {
      const returnData = this.commonService.setDataCloseLoop(getInfo, null, null, null, 11);
      this.commonService
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
          this.commonService
            .submitRequest(getInfo, null, null)
            .then((res2) => {
              this.commonService
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
                  value,
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
  }

  private async dechargeAccount(cardUser, merchantUser, merchantid, storeInBalance, sumCredit): Promise<any> {
    if (!isEmpty(storeInBalance) && storeInBalance.amount > 0) {
      this.balanceInStoreService.dechargeStoreInBalnce(merchantid, cardUser, storeInBalance.amount);
    }
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

  private async fromWallet(carduser, merchantuser, amount): Promise<any> {
    const wallet = await this.accountService.getBalance(carduser, 'wallet');
    if (wallet.balance < amount) return false;
    return this.accountService.dechargeAccount(carduser, 'wallet', amount).then((res) => {
      if (!res) return false;
      return this.accountService.chargeAccount(merchantuser, 'wallet', amount).then((res) => {
        if (!res) return false;
        const title = 'کسر از کیف پول بابت خرید اعتباری';
        return this.accountService.accountSetLogg(title, 'CreditPay-', amount, true, carduser, merchantuser);
      });
    });
  }
}
