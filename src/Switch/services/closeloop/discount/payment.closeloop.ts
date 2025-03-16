import { Injectable, CreditStatusEnums } from '@vision/common';
import { NewSwitchDto } from '../../../dto/new-switch.dto';
import { PayCommonService } from '../../../../Core/pay/services/pay-common.service';
import { discountCalc } from '@vision/common/utils/discount';
import { AccountService } from '../../../../Core/useraccount/account/account.service';
import { LoggercoreService } from '../../../../Core/logger/loggercore.service';
import { MerchantCoreTerminalBalanceService } from '../../../../Core/merchant/services/merchant-terminal-balance.service';
import { terminalSelector } from '@vision/common/utils/terminal-type-selector.util';

@Injectable()
export class SwitchDiscountPaymentService {
  constructor(
    private readonly commonService: PayCommonService,
    private readonly balanceInStoreService: MerchantCoreTerminalBalanceService,
    private readonly accountService: AccountService,
    private readonly loggerService: LoggercoreService
  ) {}

  async Buy(getInfo: NewSwitchDto, terminalInfo, cardInfo, storeInBalance): Promise<any> {
    console.log('Balance in Store', storeInBalance);
    // Check User Wallet Balance
    const checkBalance = await this.commonService.checkMoney(getInfo.TrnAmt, cardInfo.user);

    if (storeInBalance.amount >= getInfo.TrnAmt) {
      return await this.OneBuy(getInfo, cardInfo, terminalInfo, storeInBalance);
    }
    if (storeInBalance.amount > 0) {
      //  Check Balance
      if (!checkBalance) return this.commonService.Error(getInfo, 11, cardInfo.user);
      return await this.twoPay(getInfo, cardInfo, terminalInfo, storeInBalance);
    }
    //  Check Balance
    if (!checkBalance) return this.commonService.Error(getInfo, 11, cardInfo.user);
    return await this.thirdPay(getInfo, cardInfo, terminalInfo);
  }

  // TODO fix Store in Balance & Confirm
  // Pay from Balance in Store
  private async OneBuy(getInfo: NewSwitchDto, cardInfo, merchantInfo, storeinbalance): Promise<any> {
    const data = [
      { title: 'کسر از اعتبار در فروشگاه', amount: getInfo.TrnAmt.toLocaleString() },
      { title: 'امتیاز از این خرید', amount: 0 },
    ];
    this.balanceInStoreService.dechargeStoreInBalnce(merchantInfo._id, cardInfo.user, getInfo.TrnAmt);
    const title = 'خرید از فروشگاه ' + merchantInfo.title;
    const termType = terminalSelector(getInfo.termType);

    const logInfo = await this.loggerService.submitNewLogg(
      title,
      termType,
      getInfo.TrnAmt,
      true,
      cardInfo.user._id,
      null
    );
    //TODO this.commonService.SubmitError(getInfo, 20, cardInfo.user, data);
    const returnData = this.commonService.setDataCloseLoop(getInfo, data, null, null, 20);
    this.accountService.dechargeAccount(cardInfo.user, 'discount', getInfo.TrnAmt);
    this.commonService.submitDiscountRequest(0, 0, 0, 0, 0, 0, getInfo.TrnAmt, storeinbalance).then((value) => {
      this.commonService.submitRequest(getInfo, data, null).then((res2) => {
        this.commonService.submitMainRequest(
          cardInfo.user,
          cardInfo.user.ref,
          merchantInfo.merchant._id,
          merchantInfo.merchant.ref,
          merchantInfo._id,
          getInfo,
          storeinbalance,
          res2._id,
          returnData,
          CreditStatusEnums.DISCOUNT_STORE_IN_BALANCE,
          logInfo._id,
          null,
          value._id
        );
      });
    });
    return returnData;
  }

  // Pay From Wallet & Balance in Store
  private async twoPay(getInfo: NewSwitchDto, cardInfo, merchantInfo, storeInBalance): Promise<any> {
    const payedFromBalanceInStore = getInfo.TrnAmt - storeInBalance.amount;
    const value = discountCalc(payedFromBalanceInStore, merchantInfo.discnonebank, merchantInfo.discbank);

    const data1 = await this.balanceInStoreService.dechargeStoreInBalnce(
      merchantInfo._id,
      cardInfo.user,
      storeInBalance.amount
    );
    console.log(data1, 'data1');
    const data2 = await this.accountService.dechargeAccount(cardInfo.user, 'wallet', payedFromBalanceInStore);
    console.log(data2, 'data2');
    this.accountService.dechargeAccount(cardInfo.user, 'discount', storeInBalance.amount);
    if (data1 && data2) {
      const data = Array();
      data.push({ title: 'کسر از اعتبار در فروشگاه', amount: storeInBalance.amount.toLocaleString() });
      data.push({ title: 'تخفیف نقدی', amount: value.bankdisc.toLocaleString() });
      data.push({ title: 'تخفیف اعتباری', amount: value.nonebank.toLocaleString() });
      data.push({ title: 'امتیاز از این خرید', amount: 0 });
      const title = 'خرید از فروشگاه ' + merchantInfo.title;
      const logInfo = await this.loggerService.submitNewLogg(
        title,
        'POS',
        getInfo.TrnAmt,
        true,
        cardInfo.user._id,
        null
      );
      // TODO this.commonService.SubmitError(getInfo, 20, cardInfo.user, data);
      const returnData = this.commonService.setDataCloseLoop(getInfo, data, null, null, 20);
      this.commonService
        .submitDiscountRequest(
          value.companywage,
          value.cardref,
          value.merchantref,
          value.nonebank,
          value.bankdisc,
          value.discount,
          value.amount,
          storeInBalance.amount
        )
        .then((res) => {
          this.commonService.submitRequest(getInfo, data, null).then((res2) => {
            this.commonService.submitMainRequest(
              cardInfo.user,
              cardInfo.user.ref,
              merchantInfo.merchant._id,
              merchantInfo.merchant.ref,
              merchantInfo._id,
              getInfo,
              storeInBalance.amount,
              res2._id,
              returnData,
              CreditStatusEnums.DISCOUNT_STORE_IN_BALANCE_AND_WALLET,
              logInfo._id,
              null,
              res._id
            );
          });
        });
      return returnData;
    } else {
      return this.commonService.Error(getInfo, 10, cardInfo.user, ' ', ' ');
    }
  }

  // Pay From Wallet
  private async thirdPay(getInfo: NewSwitchDto, cardInfo, merchantInfo): Promise<any> {
    const value = discountCalc(getInfo.TrnAmt, merchantInfo.discnonebank, merchantInfo.discbank);
    const data1 = await this.accountService.dechargeAccount(cardInfo.user, 'wallet', getInfo.TrnAmt);
    if (data1) {
      const data = Array();
      data.push({ title: 'تخفیف نقدی', amount: value.bankdisc.toLocaleString() });
      data.push({ title: 'تخفیف اعتباری', amount: value.nonebank.toLocaleString() });
      data.push({ title: 'امتیاز از این خرید', amount: 0 });
      const title = 'خرید از فروشگاه ' + merchantInfo.title;
      const logInfo = await this.loggerService.submitNewLogg(
        title,
        'POS',
        getInfo.TrnAmt,
        true,
        cardInfo.user._id,
        null
      );
      console.log(logInfo, 'loginfo');
      // TODO this.commonService.SubmitError(getInfo, 20, cardInfo.user, data);
      const returnData = this.commonService.setDataCloseLoop(getInfo, data, null, null, 20);
      this.commonService
        .submitDiscountRequest(
          value.companywage,
          value.cardref,
          value.merchantref,
          value.nonebank,
          value.bankdisc,
          value.discount,
          value.amount,
          0
        )
        .then((res) => {
          //console.log(res);
          this.commonService.submitRequest(getInfo, data, null).then((res2) => {
            //  console.log(res2, 'res2');
            this.commonService
              .submitMainRequest(
                cardInfo.user,
                cardInfo.user.ref,
                merchantInfo.merchant._id,
                merchantInfo.merchant.ref,
                merchantInfo._id,
                getInfo,
                0,
                res2._id,
                returnData,
                CreditStatusEnums.DISCOUNT,
                logInfo._id,
                null,
                res._id
              )
              .then((res3) => {
                //  console.log(res3, 'res3');
              });
          });
        });
      return returnData;
    } else {
      return this.commonService.Error(getInfo, 10, cardInfo.user, ' ', ' ');
    }
  }
}
