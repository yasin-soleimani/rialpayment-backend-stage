import { Injectable, CreditStatusEnums } from '@vision/common';
import { MerchantCoreTerminalBalanceService } from '../../../../Core/merchant/services/merchant-terminal-balance.service';
import { PayCommonService } from '../../../../Core/pay/services/pay-common.service';
import { SwitchRequestDto } from '../../dto/SwitchRequestDto';
import { LoggercoreService } from '../../../../Core/logger/loggercore.service';
import { AccountService } from '../../../../Core/useraccount/account/account.service';
import { discountCalc } from '@vision/common/utils/discount';
import { terminalSelector } from '@vision/common/utils/terminal-type-selector.util';
import { CardService } from '../../../../Core/useraccount/card/card.service';
import { GroupCoreService } from '../../../../Core/group/group.service';
import { OrganizationStrategyService } from '../../../../Core/organization/startegy/organization-strategy.service';
import { OrganizationChargeService } from '../../../../Core/organization/charge/organization-charge.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { GroupDetailCoreService } from '../../../../Core/group/services/group-detail.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { TurnoverBalanceCoreService } from '../../../../Core/turnover/services/balance.service';

@Injectable()
export class SwitchCloseloopService {
  constructor(
    private readonly balanceInStoreService: MerchantCoreTerminalBalanceService,
    private readonly commonService: PayCommonService,
    private readonly loggerService: LoggercoreService,
    private readonly accountService: AccountService,
    private readonly cardService: CardService,
    private readonly groupService: GroupCoreService,
    private readonly groupDetailsService: GroupDetailCoreService,
    private readonly orgChargeService: OrganizationChargeService,
    private readonly organService: OrganizationStrategyService,
    private readonly turnoverService: TurnoverBalanceCoreService
  ) {}

  async newPayment(getInfo: SwitchRequestDto, cardInfo, terminalInfo, discountInfo): Promise<any> {
    console.log('closeloop started:::::::::::::::::::::::::::');
    if (!cardInfo.user) {
      return this.giftCard(getInfo, cardInfo, terminalInfo, discountInfo);
    }

    const balanceInStore = await this.balanceInStoreService.getBalanceInStore(terminalInfo._id, cardInfo.user._id);
    const discount = await this.accountService.getBalance(cardInfo.user._id, 'discount');

    // if ( )
    let BIS = {
      amount: 0,
    };

    if (!isEmpty(balanceInStore)) {
      BIS.amount = balanceInStore[0].amount;

      if (discount.balance < 100) {
        BIS.amount = 0;
      } else if (balanceInStore[0].amount < 10) {
        BIS.amount = 0;
      } else if (balanceInStore[0].amount > 100 && discount.balance > 100) {
        if (discount.balance < Number(balanceInStore[0].amount)) {
          BIS.amount = discount.balance;
        } else if (discount.balance < 10) {
          BIS.amount = 0;
        } else if (discount.balance < BIS.amount) {
          BIS.amount = discount.balance;
        }
      } else {
        BIS = {
          amount: 0,
        };
      }
    }

    switch (true) {
      case Number(getInfo.TrnAmt) <= BIS.amount: {
        console.log('1111111111');
        return this.fromBalance(getInfo, cardInfo, terminalInfo, BIS);
      }

      case BIS.amount === 0: {
        console.log('2222222222222');
        return this.fromWallet(getInfo, cardInfo, terminalInfo, discountInfo);
      }

      case BIS.amount > 0: {
        console.log('3333333333333');
        return this.fromTwice(getInfo, cardInfo, terminalInfo, discountInfo, BIS);
      }
    }
  }

  private async fromWallet(getInfo: SwitchRequestDto, cardInfo, terminalInfo, discountInfo): Promise<any> {
    console.log(discountInfo, 'discountInfo');
    const wallet = await this.accountService.getBalance(cardInfo.user, 'wallet');
    if (wallet.balance < 10) return this.commonService.setDataCloseLoop(getInfo, null, null, null, 11);
    if (wallet.balance < getInfo.TrnAmt) return this.commonService.setDataCloseLoop(getInfo, null, null, null, 11);
    const value = discountCalc(getInfo.TrnAmt, discountInfo.nonebankdisc, discountInfo.bankdisc);
    const data1 = await this.accountService.dechargeAccount(cardInfo.user, 'wallet', getInfo.TrnAmt);
    if (data1) {
      const data = Array();
      data.push({ title: 'تخفیف نقدی', amount: value.bankdisc.toLocaleString() });
      data.push({ title: 'تخفیف اعتباری', amount: value.nonebank.toLocaleString() });
      data.push({ title: 'امتیاز از این خرید', amount: 0 });
      const title = 'خرید از فروشگاه ' + terminalInfo.title + ' توسط ' + cardInfo.user.fullname || cardInfo.cardno;
      const termType = terminalSelector(getInfo.termType);
      const logInfo = await this.accountService.accountSetLogg(
        title,
        termType,
        getInfo.TrnAmt,
        true,
        cardInfo.user._id,
        null
      );
      const returnData = this.commonService.setDataCloseLoop(getInfo, data, null, null, 20);
      await this.commonService
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
        .then(async (res) => {
          await this.commonService.submitRequest(getInfo, data, null).then(async (res2) => {
            await this.commonService
              .submitMainRequest(
                cardInfo.user,
                cardInfo.user.ref,
                terminalInfo.merchant._id,
                terminalInfo.merchant.ref,
                terminalInfo._id,
                getInfo,
                0,
                res2._id,
                returnData,
                CreditStatusEnums.DISCOUNT,
                logInfo._id,
                null,
                res._id
              )
              .then((res3) => {});
          });
        });
      return returnData;
    } else {
      return this.commonService.Error(getInfo, 10, cardInfo.user, ' ', ' ');
    }
  }

  private async fromBalance(getInfo: SwitchRequestDto, cardInfo, terminalInfo, balanceinstore): Promise<any> {
    if (!balanceinstore || !balanceinstore.amount)
      return this.commonService.setDataCloseLoop(getInfo, null, null, null, 11);
    if (balanceinstore.amount < 100) return this.commonService.setDataCloseLoop(getInfo, null, null, null, 11);
    if (Number(getInfo.TrnAmt) > balanceinstore.amount)
      return this.commonService.setDataCloseLoop(getInfo, null, null, null, 11);

    const bis = await this.accountService.getBalance(cardInfo.user, 'discount');
    if (bis.balance < Number(getInfo.TrnAmt)) return this.commonService.setDataCloseLoop(getInfo, null, null, null, 11);
    if (bis.balance < balanceinstore.amount) return this.commonService.setDataCloseLoop(getInfo, null, null, null, 11);

    const data = [
      { title: 'کسر از اعتبار در فروشگاه', amount: getInfo.TrnAmt.toLocaleString() },
      { title: 'امتیاز از این خرید', amount: 0 },
    ];

    this.balanceInStoreService.dechargeStoreInBalnce(terminalInfo._id, cardInfo.user, getInfo.TrnAmt);
    const title =
      'خرید از فروشگاه ' + terminalInfo.title + ' توسط ' + cardInfo.user.fullname ||
      cardInfo.cardno + ' - اعتبار فروشگاهی';
    const termType = terminalSelector(getInfo.termType);
    const logInfo = await this.accountService.accountSetLogg(
      title,
      termType,
      getInfo.TrnAmt,
      true,
      cardInfo.user._id,
      null
    );
    //TODO this.commonService.SubmitError(getInfo, 20, cardInfo.user, data);
    const returnData = this.commonService.setDataCloseLoop(getInfo, data, null, null, 20);
    await this.accountService.dechargeAccount(cardInfo.user, 'discount', getInfo.TrnAmt);
    this.turnoverService.dechargeUser('discount', cardInfo.user._id, getInfo.TrnAmt, logInfo.ref, title);

    await this.commonService
      .submitDiscountRequest(0, 0, 0, 0, 0, 0, getInfo.TrnAmt, balanceinstore.amount)
      .then(async (value) => {
        await this.commonService.submitRequest(getInfo, data, null).then(async (res2) => {
          await this.commonService.submitMainRequest(
            cardInfo.user,
            cardInfo.user.ref,
            terminalInfo.merchant._id,
            terminalInfo.merchant.ref,
            terminalInfo._id,
            getInfo,
            balanceinstore.amount,
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

  private async fromTwice(
    getInfo: SwitchRequestDto,
    cardInfo,
    terminalInfo,
    discountInfo,
    balanceinstore
  ): Promise<any> {
    let payedFromBalanceInStore = Number(getInfo.TrnAmt) - balanceinstore.amount;
    if (payedFromBalanceInStore < 10) payedFromBalanceInStore = 0;

    const wallet = await this.accountService.getBalance(cardInfo.user, 'wallet');
    if (wallet.balance < 10) return this.commonService.setDataCloseLoop(getInfo, null, null, null, 11);

    if (wallet.balance < payedFromBalanceInStore)
      return this.commonService.setDataCloseLoop(getInfo, null, null, null, 11);
    const value = discountCalc(payedFromBalanceInStore, discountInfo.nonebankdisc, discountInfo.bankdisc);

    const data1 = await this.balanceInStoreService.dechargeStoreInBalnce(
      terminalInfo._id,
      cardInfo.user,
      balanceinstore.amount
    );
    const data2 = await this.accountService.dechargeAccount(cardInfo.user, 'wallet', payedFromBalanceInStore);
    this.accountService.dechargeAccount(cardInfo.user, 'discount', balanceinstore.amount);
    if (data1 && data2) {
      const data = Array();
      data.push({ title: 'کسر از اعتبار در فروشگاه', amount: balanceinstore.amount.toLocaleString() });
      data.push({ title: 'تخفیف نقدی', amount: value.bankdisc.toLocaleString() });
      data.push({ title: 'تخفیف اعتباری', amount: value.nonebank.toLocaleString() });
      data.push({ title: 'امتیاز از این خرید', amount: 0 });

      const title = 'خرید از فروشگاه ' + terminalInfo.title + ' توسط ' + cardInfo.user.fullname || cardInfo.cardno;
      const termType = terminalSelector(getInfo.termType);

      const logInfo = await this.accountService.accountSetLogg(
        title,
        termType,
        getInfo.TrnAmt,
        true,
        cardInfo.user._id,
        null
      );
      this.turnoverService.dechargeUser('discount', cardInfo.user._id, getInfo.TrnAmt, logInfo.ref, title);

      // TODO this.commonService.SubmitError(getInfo, 20, cardInfo.user, data);
      const returnData = this.commonService.setDataCloseLoop(getInfo, data, null, null, 20);
      await this.commonService
        .submitDiscountRequest(
          value.companywage,
          value.cardref,
          value.merchantref,
          value.nonebank,
          value.bankdisc,
          value.discount,
          value.amount,
          balanceinstore.amount
        )
        .then(async (res) => {
          await this.commonService.submitRequest(getInfo, data, null).then(async (res2) => {
            console.log(
              'Main Psp Verify Data',
              await this.commonService.submitMainRequest(
                cardInfo.user,
                cardInfo.user.ref,
                terminalInfo.merchant._id,
                terminalInfo.merchant.ref,
                terminalInfo._id,
                getInfo,
                balanceinstore.amount,
                res2._id,
                returnData,
                CreditStatusEnums.DISCOUNT_STORE_IN_BALANCE_AND_WALLET,
                logInfo._id,
                null,
                res._id
              )
            );
          });
        });
      return returnData;
    } else {
      return this.commonService.Error(getInfo, 10, cardInfo.user, ' ', ' ');
    }
  }

  private async giftCard(getInfo: SwitchRequestDto, cardInfo, terminalInfo, discountInfo): Promise<any> {
    // check if group has details
    const groupDetails = await this.groupDetailsService.getDetails(cardInfo.group);

    if (groupDetails) {
      // check if there are any specific terminals in group details
      const terminalExists = await this.groupDetailsService.checkIfTerminalExistsInGroupDetails(terminalInfo._id);

      // if the card is restricted to some specific terminals, but
      // current terminal is not listed in them, throw a invalid card exception
      // otherwise do the routine job
      if (!terminalExists && groupDetails.isRestricted) {
        return this.commonService.Error(getInfo, 1, null, null, null);
      }
    }

    const stMode = await this.checkOrganization(terminalInfo, cardInfo, getInfo);
    if (stMode) {
      return this.fromOrganizationCharge(stMode, getInfo, terminalInfo, cardInfo);
    }
    const balanceInStore = await this.balanceInStoreService.getBalanceInStoreWithCard(terminalInfo._id, cardInfo._id);
    let BIS = {
      amount: 0,
    };
    if (balanceInStore.length > 0) {
      BIS.amount = balanceInStore[0].amount;
    }

    switch (true) {
      case BIS.amount === 0: {
        return this.fromPayWallet(getInfo, terminalInfo, cardInfo);
      }

      case BIS.amount >= Number(getInfo.TrnAmt): {
        return this.fromCardBalance(BIS, getInfo, terminalInfo, cardInfo, balanceInStore);
      }

      case BIS.amount < Number(getInfo.TrnAmt): {
        break;
      }
    }
  }

  async checkOrganization(terminalInfo, cardInfo, getInfo: SwitchRequestDto): Promise<any> {
    let terminal = Array();
    let group = Array();
    terminal.push(terminalInfo._id);

    const groupData = await this.groupService.getCardGroups(cardInfo._id);
    if (!groupData) return null;
    // check groupData !!!!!!
    for (let i = 0; groupData.length > i; i++) {
      group.push(groupData[i].group);
    }
    return this.organService.getOrganStrategy(group, terminal);
  }

  private async fromPayWallet(getInfo, terminalInfo, cardInfo): Promise<any> {
    if (cardInfo.amount < getInfo.TrnAmt) return this.commonService.setDataCloseLoop(getInfo, null, null, null, 11);

    await this.cardService.dechargeAmount(cardInfo._id, getInfo.TrnAmt);

    const data = [
      { title: 'کسر از کیف پول ', amount: getInfo.TrnAmt.toLocaleString() },
      { title: 'امتیاز از این خرید', amount: 0 },
    ];
    const title = 'خرید از فروشگاه ' + terminalInfo.title + ' توسط ' + cardInfo.cardno || cardInfo.cardno;
    const termType = terminalSelector(getInfo.termType);

    const logInfo = await this.loggerService.submitNewLogg(title, termType, getInfo.TrnAmt, true, cardInfo.null, null);

    const returnData = this.commonService.setDataCloseLoop(getInfo, data, null, null, 20);

    await this.commonService.submitDiscountRequest(0, 0, 0, 0, 0, 0, getInfo.TrnAmt, 0).then(async (res) => {
      await this.commonService.submitRequest(getInfo, data, null).then(async (res2) => {
        await this.commonService
          .submitMainRequest(
            null,
            null,
            terminalInfo.merchant._id,
            terminalInfo.merchant.ref,
            terminalInfo._id,
            getInfo,
            0,
            res2._id,
            returnData,
            CreditStatusEnums.GIFT_CARD,
            logInfo._id,
            null,
            res._id
          )
          .then((res3) => {});
      });
    });

    return returnData;
  }

  private async fromOrganizationCharge(stMode, getInfo, terminalInfo, cardInfo): Promise<any> {
    let data = Array();
    const balance = await this.orgChargeService.getCardBalance(cardInfo._id);
    if (balance.amount < getInfo.TrnAmt) return this.commonService.Error(getInfo, 11, cardInfo.user._id);

    data.push({ title: ' کسر از اعتبار سازمانی ', amount: getInfo.TrnAmt });

    this.orgChargeService.dechargeCard(cardInfo._id, getInfo.TrnAmt);
    const logInfo = await this.accountService.accountSetLogg(
      ' خرید سازمانی',
      'OrgPay',
      getInfo.TrnAmt,
      true,
      null,
      terminalInfo.merchant.user
    );

    const returnData = this.commonService.setDataCloseLoop(getInfo, data, null, null, 20);
    this.commonService
      .submitOrganRequest(
        null,
        stMode._id,
        terminalInfo._id,
        getInfo.TrnAmt,
        0,
        0,
        getInfo.TrnAmt,
        stMode.user,
        cardInfo._id
      )
      .then((res) => {
        this.commonService.submitRequest(getInfo, data, null).then((res2) => {
          this.commonService.submitMainRequest(
            cardInfo.user,
            null,
            terminalInfo.merchant,
            terminalInfo.merchant.ref,
            terminalInfo._id,
            getInfo,
            0,
            res2._id,
            returnData,
            CreditStatusEnums.SHETAB,
            logInfo._id,
            null,
            res._id
          );
        });
      });
    return returnData;
  }

  private async fromCardBalance(BIS, getInfo, terminalInfo, cardInfo, balanceInStore): Promise<any> {
    if (BIS.amount < getInfo.TrnAmt) return this.commonService.setDataCloseLoop(getInfo, null, null, null, 11);
    this.balanceInStoreService.dechargeStoreWithCard(terminalInfo._id, cardInfo._id, getInfo.TrnAmt);

    const data = [
      { title: 'کسر از اعتبار در فروشگاه', amount: getInfo.TrnAmt.toLocaleString() },
      { title: 'امتیاز از این خرید', amount: 0 },
    ];
    const title = 'خرید از فروشگاه ' + terminalInfo.title + ' کسر از اعتبار در فروشگاه';

    const termType = terminalSelector(getInfo.termType);

    const logInfo = await this.loggerService.submitNewLogg(
      title,
      termType,
      getInfo.TrnAmt,
      true,
      null,
      terminalInfo.merchant.user
    );
    this.turnoverService.dechargeCard('discount', cardInfo._id, getInfo.TrnAmt, logInfo.ref, title);

    const returnData = this.commonService.setDataCloseLoop(getInfo, data, null, null, 20);

    await this.commonService
      .submitDiscountRequest(0, 0, 0, 0, 0, 0, getInfo.TrnAmt, getInfo.TrnAmt)
      .then(async (value) => {
        await this.commonService.submitRequest(getInfo, data, null).then(async (res2) => {
          await this.commonService.submitMainRequest(
            null,
            null,
            terminalInfo.merchant._id,
            terminalInfo.merchant.ref,
            terminalInfo._id,
            getInfo,
            getInfo.TrnAmt,
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
}
