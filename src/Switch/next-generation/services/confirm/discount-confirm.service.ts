import { Injectable } from '@vision/common';
import { AccountService } from '../../../../Core/useraccount/account/account.service';
import { PayCommonService } from '../../../../Core/pay/services/pay-common.service';
import { PspverifyCoreService } from '../../../../Core/psp/pspverify/pspverifyCore.service';
import { MerchantcoreService } from '../../../../Core/merchant/merchantcore.service';
import { TurnoverBalanceCoreService } from '../../../../Core/turnover/services/balance.service';

@Injectable()
export class SwitchDiscountConfirmService {
  constructor(
    private readonly accountService: AccountService,
    private readonly commonService: PayCommonService,
    private readonly pspverifyService: PspverifyCoreService,
    private readonly merchantService: MerchantcoreService,
    private readonly turnoverService: TurnoverBalanceCoreService
  ) {}

  async confirm(traxData, getInfo): Promise<any> {
    console.log(traxData.terminal.merchant.user);
    if (traxData.confirm === true || traxData.reverse === true) {
      return this.commonService.Error(getInfo, 15, null, ' ', ' ');
    }
    let confirm;
    if (traxData?.terminal?._id) {
      console.log('In Terminal Confirm!!!!!!!!!');
      confirm = await this.pspverifyService.confirmByTraxAndTerminal(traxData.TraxID, traxData?.terminal?._id);
    } else confirm = await this.pspverifyService.confirm(traxData.TraxID);
    console.log(confirm);
    if (confirm) {
      // set user wages
      if (traxData.discount.bankdisc > 0)
        this.accountService.chargeAccount(traxData.user.id, 'wallet', traxData.discount.bankdisc);
      if (traxData.discount.nonebank > 0)
        this.accountService.chargeAccount(traxData.user.id, 'discount', traxData.discount.nonebank);
      const historyData = await this.merchantService.setMerchantTerminalHistoryLog(
        traxData.user.id,
        traxData.terminal.id,
        traxData.discount.nonebank,
        0
      );
      this.merchantService.submitNewMerchantHistory(historyData).then((value) => {});
      // set merchant amount & logg

      const mtitle = 'خرید از شماره پایانه ' + traxData.terminal.terminalid;
      this.accountService.accountSetLoggWithRef(
        mtitle,
        traxData.log.ref,
        traxData.discount.amount,
        true,
        traxData.terminal.merchant.user,
        traxData.terminal.merchant.user
      );
      this.accountService.chargeAccount(traxData.terminal.merchant.user, 'wallet', traxData.discount.amount);

      // submit user loggs
      const title = 'شارژ کیف پول بابت تخفیف نقدی از فروشگاه ' + traxData.terminal.title;
      this.accountService.accountSetLogg(title, 'BankDisc', traxData.discount.bankdisc, true, null, traxData.user.id);

      const titlenonebank = 'شارژ اعتبار تخفیف در فروشگاه ' + traxData.terminal.title;
      const data = await this.accountService.accountSetLogg(
        titlenonebank,
        'NoneDisc',
        traxData.discount.nonebank,
        true,
        null,
        traxData.user.id
      );
      this.turnoverService.ChargeUser(
        'discount',
        traxData.terminal._id,
        traxData.user.id,
        traxData.discount.nonebank,
        data.ref,
        titlenonebank
      );
      const merchantwagereftitle = 'شارژ کیف پول بابت ثبت فروشگاه ' + traxData.terminal.title;
      this.accountService.accountSetLogg(
        merchantwagereftitle,
        'MerchantWage',
        traxData.discount.merchantref,
        true,
        null,
        traxData.terminal.merchant.ref
      );
      this.accountService.chargeAccount(traxData.terminal.merchant.ref, 'wallet', traxData.discount.merchantref);

      // return success
      return this.commonService.setDataCloseLoop(getInfo, null, null, null, 17);
    } else {
      // return problem
      return this.commonService.Error(getInfo, 10, traxData.user.id);
    }
  }

  async BalanceInStoreConfirm(traxData, getInfo): Promise<any> {
    if (traxData.confirm === true || traxData.reverse === true) {
      return this.commonService.Error(getInfo, 15, null, ' ', ' ');
    }
    const confirm = await this.pspverifyService.confirm(traxData.TraxID);
    if (confirm) {
      const mtitle = 'خرید از شماره پایانه ' + traxData.terminal.terminalid + '- توسط شارژ اعتبار در فروشگاه ';
      this.accountService.accountSetLogg(
        mtitle,
        'Pos',
        traxData.discount.amount,
        true,
        null,
        traxData.terminal.merchant.user
      );
      // this.accountService.chargeAccount(traxData.terminal.merchant.user, 'wallet', traxData.discount.amount);

      return this.commonService.setDataCloseLoop(getInfo, null, null, null, 17);
    } else {
      {
        return this.commonService.Error(getInfo, 10, traxData.user.id);
      }
    }
  }

  async confirmCardPayWallet(traxData, getInfo): Promise<any> {
    if (traxData.confirm === true || traxData.reverse === true) {
      return this.commonService.Error(getInfo, 15, null, ' ', ' ');
    }

    const confirm = await this.pspverifyService.confirm(traxData.TraxID);
    if (confirm) {
      // set merchant amount & logg
      const mtitle = 'خرید از شماره پایانه ' + traxData.terminal.terminalid;
      this.accountService.accountSetLogg(
        mtitle,
        'Pos',
        traxData.discount.amount,
        true,
        null,
        traxData.terminal.merchant.user
      );

      this.accountService.chargeAccount(traxData.terminal.merchant.user, 'wallet', traxData.discount.amount);

      return this.commonService.setDataCloseLoop(getInfo, null, null, null, 17);
    }
  }

  async confirmLeasing(traxData, getInfo): Promise<any> {
    console.log(
      'LEASING CONFIRM:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: 1'
    );
    if (traxData.confirm === true || traxData.reverse === true) {
      return this.commonService.Error(getInfo, 15, null, ' ', ' ');
    }

    const confirm = await this.pspverifyService.confirm(traxData.TraxID);
    if (confirm) {
      console.log(
        'LEASING CONFIRM:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: 2',
        traxData
      );
      const mtitle = 'خرید از شماره پایانه ' + traxData.terminal.terminalid;

      let total = traxData.discount.amount;
      for (const item of traxData.discount.lecredits) {
        total = total + item.amount;
      }
      this.accountService.accountSetLoggWithRef(
        mtitle,
        traxData.log.ref,
        total,
        true,
        null,
        traxData.terminal.merchant.user
      );
      console.log(
        'LEASING CONFIRM:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: 3',
        total
      );
      this.accountService.chargeAccount(traxData.terminal.merchant.user, 'wallet', total);
      // return success
      return this.commonService.setDataCloseLoop(getInfo, null, null, null, 17);
    } else {
      // return problem
      return this.commonService.Error(getInfo, 10, traxData.user.id);
    }
  }
}
