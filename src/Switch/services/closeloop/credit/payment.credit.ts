import { Injectable, CreditStatusEnums, CreditChargeStatusEnums } from '@vision/common';
import { NewSwitchDto } from '../../../dto/new-switch.dto';
import { PayCommonService } from '../../../../Core/pay/services/pay-common.service';
import { SwitchDiscountPaymentService } from '../discount/payment.closeloop';
import { AccountService } from '../../../../Core/useraccount/account/account.service';
import { PayCreditService } from '../../../../Core/pay/services/pay-credit.service';
import { MerchantCreditCoreService } from '../../../../Core/credit/merchantcredit/merchantcredit.service';
import { UserCreditCoreService } from '../../../../Core/credit/usercredit/credit-core.service';
import { MerchantcoreService } from '../../../../Core/merchant/merchantcore.service';
import * as UniqueNumber from 'unique-number';
import { LoggercoreService } from '../../../../Core/logger/loggercore.service';
import { MerchantCoreTerminalBalanceService } from '../../../../Core/merchant/services/merchant-terminal-balance.service';

@Injectable()
export class SwitchCreditPaymentService {
  constructor(
    private readonly commonService: PayCommonService,
    private readonly discountPay: SwitchDiscountPaymentService,
    private readonly accountService: AccountService,
    private readonly payCredit: PayCreditService,
    private readonly merchantCreditService: MerchantCreditCoreService,
    private readonly userCreditService: UserCreditCoreService,
    private readonly balanceInStoreService: MerchantCoreTerminalBalanceService,
    private readonly loggerService: LoggercoreService
  ) {}

  async Buy(getInfo: NewSwitchDto, terminalInfo, cardInfo, storeInBalance): Promise<any> {
    if (storeInBalance.amount >= getInfo.TrnAmt) {
      return await this.discountPay.Buy(getInfo, terminalInfo, cardInfo, storeInBalance);
    }

    if (storeInBalance.amount > 0) {
      return await this.Three(getInfo, cardInfo, terminalInfo, storeInBalance);
    }
    return await this.Three(getInfo, cardInfo, terminalInfo, storeInBalance);
  }

  // Payment from Wallet
  private async Three(getInfo: NewSwitchDto, cardInfo, merchantInfo, storeInBalance): Promise<any> {
    // get Merchant Credit Strategy
    const merchantCreditInfo = await this.merchantCreditService.getTerminalCreditInfo(merchantInfo._id);
    // calc Credit
    const data = await this.payCredit.creditCalc(
      getInfo.TrnAmt,
      merchantCreditInfo.advance.qty,
      merchantCreditInfo.advance.benefit,
      merchantCreditInfo.advance.freemonths,
      CreditChargeStatusEnums.Transferable,
      merchantCreditInfo.advance.prepayment,
      cardInfo.user,
      merchantCreditInfo.type,
      storeInBalance
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
        this.userCreditService.signleChargeUserCredit(
          merchantInfo.merchant.user,
          value.amount,
          value.date,
          CreditChargeStatusEnums.SecondTransfer,
          cardInfo.user._id
        );
        // this.userCreditService.chargeUserCredit(merchantInfo.merchant.user, value.amount, value.date, CreditChargeStatusEnums.SecondTransfer,  cardInfo.user._id);
      });
      // decharge Acconts & Charge Merchant Account
      this.dechargeAccount(
        cardInfo.user._id,
        merchantInfo.merchant.user,
        merchantInfo._id,
        storeInBalance,
        data.sumAmount
      );

      const logInfo = await this.setLogg(
        merchantInfo.title,
        data.sumCredit,
        cardInfo.user._id,
        merchantInfo.merchant.user
      );

      this.commonService
        .submitCreditRequest(
          cardInfo.user._id,
          merchantInfo.merchant.user,
          merchantInfo._id,
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
                  cardInfo.user,
                  cardInfo.user.ref,
                  merchantInfo.merchant._id,
                  merchantInfo.merchant.ref,
                  merchantInfo._id,
                  getInfo,
                  storeInBalance.amount,
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
          merchantInfo.merchant.user,
          merchantInfo._id,
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
                  cardInfo.user,
                  cardInfo.user.ref,
                  merchantInfo.merchant._id,
                  merchantInfo.merchant.ref,
                  merchantInfo._id,
                  getInfo,
                  storeInBalance.amount,
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
    }
  }

  private async getCalcStatus(data, cardInfo): Promise<any> {
    // set variable (Array) to print
    let listPrint = Array();
    if (data.balanceinStore > 0) {
      listPrint.push({ title: ' کسر از اعتبار در فروشگاه', amount: data.balanceinStore });
    } else {
      listPrint.push({ title: ' کسر از اعتبار در فروشگاه', amount: 0 });
    }
    // cehck mechant prepayment
    if (data.prepayment > 0) {
      listPrint.push({ title: ' پیش پرداخت', amount: data.prepayment });
    } else {
      listPrint.push({ title: ' پیش پرداخت', amount: 0 });
    }
    if (data.fromWallet > 0) {
      listPrint.push({ title: ' کسر از کیف پول', amount: data.fromWallet });
    } else {
      listPrint.push({ title: ' کسر از کیف پول', amount: 0 });
    }
    // get users credit
    const totalCredit = await this.accountService.getBalance(cardInfo.user, 'credit');
    // push to list print
    listPrint.push({ title: 'مانده اعتبار', amount: totalCredit.balance });
    // set variable (Array) to print
    return listPrint;
  }

  private async setLogg(titlex, sumCredit, cardUser, merchantUser): Promise<any> {
    const title = 'خرید اعتباری از فروشگاه ' + titlex;
    const uniqueNumber = new UniqueNumber(true);
    const ref = 'CreditPay-' + uniqueNumber.generate();
    const log = this.loggerService.setLogg(title, ref, sumCredit, true, cardUser, merchantUser);
    return this.loggerService.newLogg(log);
  }

  private async dechargeAccount(cardUser, merchantUser, merchantid, storeInBalance, sumCredit): Promise<any> {
    this.accountService.dechargeAccount(cardUser, 'credit', sumCredit).then((value) => {
      console.log('decharge', value);
    });
    this.accountService.chargeAccount(merchantUser, 'credit', sumCredit).then((value) => {
      console.log('charge', value);
    });
    if (storeInBalance.amount > 0) {
      this.balanceInStoreService.dechargeStoreInBalnce(merchantid, cardUser, storeInBalance.amount);
    }
  }
}
