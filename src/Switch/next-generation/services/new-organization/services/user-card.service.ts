import { CreditStatusEnums, Injectable } from '@vision/common';
import { discountCalc } from '@vision/common/utils/discount';
import { terminalSelector } from '@vision/common/utils/terminal-type-selector.util';
import { OrganizationNewChargeCoreService } from '../../../../../Core/organization/new-charge/charge.service';
import { LoggercoreService } from '../../../../../Core/logger/loggercore.service';
import { MerchantCoreTerminalBalanceService } from '../../../../../Core/merchant/services/merchant-terminal-balance.service';
import { PayCommonService } from '../../../../../Core/pay/services/pay-common.service';
import { AccountService } from '../../../../../Core/useraccount/account/account.service';
import { UserService } from '../../../../../Core/useraccount/user/user.service';
import { SwitchRequestDto } from '../../../../../Switch/next-generation/dto/SwitchRequestDto';
import { NewOrganizationSwitchCommonService } from './common.service';
import { OrganizationPoolCoreService } from '../../../../../Core/organization/pool/pool.service';
import { GeneralService } from '../../../../../Core/service/general.service';
import { TurnoverBalanceCoreService } from '../../../../../Core/turnover/services/balance.service';

@Injectable()
export class NewOrganizationSwitchUserCardService {
  constructor(
    private readonly userService: UserService,
    private readonly balanceInStoreService: MerchantCoreTerminalBalanceService,
    private readonly loggerService: LoggercoreService,
    private readonly commonService: PayCommonService,
    private readonly accountService: AccountService,
    private readonly orgCommonService: NewOrganizationSwitchCommonService,
    private readonly orgChargeService: OrganizationNewChargeCoreService,
    private readonly poolService: OrganizationPoolCoreService,
    private readonly generalService: GeneralService,
    private readonly turnoverService: TurnoverBalanceCoreService
  ) {}

  async fromBalance(getInfo: SwitchRequestDto, cardInfo, terminalInfo, balanceinstore): Promise<any> {
    if (!balanceinstore) return this.commonService.setDataCloseLoop(getInfo, null, null, null, 11);
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
    const title = 'خرید از فروشگاه ' + terminalInfo.title + ' توسط ' + cardInfo.user.fullname || cardInfo.cardno;
    const termType = terminalSelector(getInfo.termType);
    const logInfo = await this.loggerService.submitNewLogg(
      title,
      termType,
      getInfo.TrnAmt,
      true,
      cardInfo.user._id,
      null
    );

    this.turnoverService.dechargeUser('discount', cardInfo.user._id, getInfo.TrnAmt, logInfo.ref, title);

    //TODO this.commonService.SubmitError(getInfo, 20, cardInfo.user, data);
    const returnData = this.commonService.setDataCloseLoop(getInfo, data, null, null, 20);
    await this.accountService.dechargeAccount(cardInfo.user, 'discount', getInfo.TrnAmt);
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

  async fromThird(getInfo: SwitchRequestDto, cardInfo, terminalInfo, balanceinstore, discountInfo, pool): Promise<any> {
    const orgWallet = await this.orgChargeService.getUserBalance(cardInfo.user._id, pool._id);
    let orgBalance = 0;
    if (orgWallet) orgBalance = orgWallet.remain;

    const wallet = await this.accountService.getBalance(cardInfo.user._id, 'wallet');
    if (pool.remain < orgBalance) return this.commonService.Error(getInfo, 1, null, null, null);

    const balance = balanceinstore.amount + orgBalance + wallet.balance;
    const payedFromBalanceInStore = getInfo.TrnAmt - balanceinstore.amount;
    const fromWallet = getInfo.TrnAmt - (balanceinstore.amount + orgBalance);

    if (balance < getInfo.TrnAmt) return this.commonService.setDataCloseLoop(getInfo, null, null, null, 11);

    const value = discountCalc(payedFromBalanceInStore, discountInfo.nonebankdisc, discountInfo.bankdisc);
    // const bTitle = 'خرید از فروشگاه ' + terminalInfo.title ;
    const bTitle = 'خرید شماره کارت ' + cardInfo.cardno + ' از فروشگاه ' + terminalInfo.title;
    this.turnoverService.dechargeUser('discount', cardInfo.user._id, getInfo.TrnAmt, getInfo.TraxID.toString(), bTitle);

    const balanceD = await this.balanceInStoreService.dechargeStoreInBalnce(
      terminalInfo._id,
      cardInfo.user,
      balanceinstore.amount
    );
    const orgD = await this.orgChargeService.dechargeUser(
      cardInfo.user._id,
      orgBalance,
      terminalInfo.merchant.user,
      bTitle,
      pool._id
    );
    const walletD = await this.accountService.dechargeAccount(cardInfo.user._id, 'wallet', fromWallet);
    const orgWalletD = await this.accountService.dechargeAccount(cardInfo.user._id, 'org', orgBalance);
    const poolD = await this.poolService.decharge(
      pool._id,
      orgBalance,
      cardInfo.user._id,
      bTitle,
      null,
      getInfo.TraxID.toString()
    );
    this.sendMinSms(poolD);

    if (balanceD && orgD && walletD && poolD && orgWalletD) {
      const data = Array();
      data.push({ title: 'کسر از اعتبار در فروشگاه', amount: balanceinstore.amount.toLocaleString() });
      data.push({ title: 'کسر از اعتبار سازمانی ', amount: orgBalance.toLocaleString() });
      data.push({ title: 'کسر از کیف پول ', amount: fromWallet.toLocaleString() });
      data.push({ title: 'تخفیف نقدی', amount: value.bankdisc.toLocaleString() });
      data.push({ title: 'تخفیف اعتباری', amount: value.nonebank.toLocaleString() });
      data.push({ title: 'امتیاز از این خرید', amount: 0 });
      const title = 'خرید از فروشگاه ' + terminalInfo.title + ' توسط ' + cardInfo.user.fullname || cardInfo.cardno;
      const termType = terminalSelector(getInfo.termType);
      const logInfo = await this.loggerService.submitNewLogg(
        title,
        termType,
        getInfo.TrnAmt,
        true,
        cardInfo.user._id,
        null
      );

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
          balanceinstore.amount,
          orgBalance,
          [
            {
              pool: pool._id,
              amount: orgBalance,
            },
          ]
        )
        .then(async (res) => {
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
              CreditStatusEnums.ORGANIZATION_AND_WALLET_BALANCE_IN_STORE,
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

  async fromTwice(getInfo: SwitchRequestDto, cardInfo, terminalInfo, discountInfo, pool): Promise<any> {
    const orgWallet = await this.orgChargeService.getUserBalance(cardInfo.user._id, pool._id);
    let orgBalance = 0;
    if (orgWallet) orgBalance = orgWallet.remain;

    if (pool.remain < orgBalance) return this.commonService.Error(getInfo, 1, null, null, null);

    const wallet = await this.accountService.getBalance(cardInfo.user._id, 'wallet');

    const balance = orgBalance + wallet.balance;
    const fromWallet = getInfo.TrnAmt - orgBalance;
    if (balance < getInfo.TrnAmt) return this.commonService.setDataCloseLoop(getInfo, null, null, null, 11);

    const value = discountCalc(getInfo.TrnAmt, discountInfo.nonebankdisc, discountInfo.bankdisc);

    const bTitle = 'خرید شماره کارت ' + cardInfo.cardno + ' از فروشگاه ' + terminalInfo.title;

    const orgD = await this.orgChargeService.dechargeUser(
      cardInfo.user._id,
      orgBalance,
      terminalInfo.merchant.user,
      bTitle,
      pool._id
    );
    const walletD = await this.accountService.dechargeAccount(cardInfo.user._id, 'wallet', fromWallet);
    const poolD = await this.poolService.decharge(
      pool._id,
      orgBalance,
      cardInfo.user._id,
      bTitle,
      null,
      getInfo.TraxID.toString()
    );
    const orgWalletD = await this.accountService.dechargeAccount(cardInfo.user._id, 'org', orgBalance);
    this.sendMinSms(poolD);

    if (orgD && walletD && poolD && orgWalletD) {
      const data = Array();
      data.push({ title: 'کسر از اعتبار سازمانی ', amount: orgBalance.toLocaleString() });
      data.push({ title: 'کسر از کیف پول ', amount: fromWallet.toLocaleString() });
      data.push({ title: 'تخفیف نقدی', amount: value.bankdisc.toLocaleString() });
      data.push({ title: 'تخفیف اعتباری', amount: value.nonebank.toLocaleString() });
      data.push({ title: 'امتیاز از این خرید', amount: 0 });
      const title = 'خرید از فروشگاه ' + terminalInfo.title + ' توسط ' + cardInfo.user.fullname || cardInfo.cardno;
      const termType = terminalSelector(getInfo.termType);
      const logInfo = await this.loggerService.submitNewLogg(
        title,
        termType,
        getInfo.TrnAmt,
        true,
        cardInfo.user._id,
        null
      );
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
          0,
          orgBalance,
          [
            {
              pool: pool._id,
              amount: orgBalance,
            },
          ]
        )
        .then(async (res) => {
          await this.commonService.submitRequest(getInfo, data, null).then(async (res2) => {
            await this.commonService.submitMainRequest(
              cardInfo.user,
              cardInfo.user.ref,
              terminalInfo.merchant._id,
              terminalInfo.merchant.ref,
              terminalInfo._id,
              getInfo,
              0,
              res2._id,
              returnData,
              CreditStatusEnums.ORGANIZATION_AND_WALLET,
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

  async fromOrgCharge(getInfo: SwitchRequestDto, cardInfo, terminalInfo, discountInfo, pool): Promise<any> {
    const orgWallet = await this.orgChargeService.getUserBalance(cardInfo.user._id, pool._id);
    let orgBalance = 0;
    if (orgWallet) orgBalance = orgWallet.remain;
    if (pool.remain < orgBalance) return this.commonService.Error(getInfo, 1, null, null, null);

    if (orgBalance < getInfo.TrnAmt) return this.commonService.setDataCloseLoop(getInfo, null, null, null, 11);
    const value = discountCalc(getInfo.TrnAmt, discountInfo.nonebankdisc, discountInfo.bankdisc);

    const bTitle = 'خرید شماره کارت ' + cardInfo.cardno + ' از فروشگاه ' + terminalInfo.title;
    const orgD = await this.orgChargeService.dechargeUser(
      cardInfo.user._id,
      getInfo.TrnAmt,
      terminalInfo.merchant.user,
      bTitle,
      pool._id
    );
    const poolD = await this.poolService.decharge(
      pool._id,
      getInfo.TrnAmt,
      cardInfo.user._id,
      bTitle,
      null,
      getInfo.TraxID.toString()
    );
    const orgWalletD = await this.accountService.dechargeAccount(cardInfo.user._id, 'org', getInfo.TrnAmt);
    this.sendMinSms(poolD);
    if (orgD && poolD && orgWalletD) {
      const data = Array();
      data.push({ title: 'کسر از اعتبار سازمانی ', amount: getInfo.TrnAmt.toLocaleString() });
      data.push({ title: 'تخفیف نقدی', amount: value.bankdisc.toLocaleString() });
      data.push({ title: 'تخفیف اعتباری', amount: value.nonebank.toLocaleString() });
      data.push({ title: 'امتیاز از این خرید', amount: 0 });
      const title = 'خرید از فروشگاه ' + terminalInfo.title + ' توسط ' + cardInfo.user.fullname || cardInfo.cardno;
      const termType = terminalSelector(getInfo.termType);
      const logInfo = await this.loggerService.submitNewLogg(
        title,
        termType,
        getInfo.TrnAmt,
        true,
        cardInfo.user._id,
        null
      );
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
          0,
          getInfo.TrnAmt,
          [
            {
              pool: pool._id,
              amount: getInfo.TrnAmt,
            },
          ]
        )
        .then(async (res) => {
          await this.commonService.submitRequest(getInfo, data, null).then(async (res2) => {
            await this.commonService.submitMainRequest(
              cardInfo.user,
              cardInfo.user.ref,
              terminalInfo.merchant._id,
              terminalInfo.merchant.ref,
              terminalInfo._id,
              getInfo,
              0,
              res2._id,
              returnData,
              CreditStatusEnums.ORGANIZATION,
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

  async sendMinSms(pool: any): Promise<any> {
    const poolInfo = await this.poolService.getPoolInfo(pool._id);
    if (poolInfo) {
      if (pool.remain <= poolInfo.minremain) {
        let poolOwnerMobile = '0' + poolInfo.user.mobile;

        if (poolInfo.user.type == 'customerclub') {
          const userInfo = await this.userService.getInfoByUserid(poolInfo.user.ref);
          if (userInfo) {
            poolOwnerMobile = '0' + userInfo.mobile;
          }
        }
        const message =
          ' ریال پیمنت \n' +
          'استخر پول : ' +
          poolInfo.title +
          'ریال \n' +
          'موجودی: ' +
          pool.remain +
          ' \n' +
          'جهت شارژ استخر پول به پورتال مراجعه نمایید \n' +
          ' https://portal.rialpayment.ir \n' +
          'تماس با پشتیبانی:  09363677791';
        // const message = '''
        this.generalService.AsanaksendSMS(null, null, null, poolOwnerMobile, message);
      }
    }
  }
}
