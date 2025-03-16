import { Injectable } from '@vision/common';
import { PayCommonService } from '../../../../Core/pay/services/pay-common.service';
import { PspverifyCoreService } from '../../../../Core/psp/pspverify/pspverifyCore.service';
import { AccountService } from '../../../../Core/useraccount/account/account.service';
import { MerchantcoreService } from '../../../../Core/merchant/merchantcore.service';

@Injectable()
export class SwitchShetabConfirmService {
  constructor(
    private readonly commonService: PayCommonService,
    private readonly pspverifyService: PspverifyCoreService,
    private readonly merchantService: MerchantcoreService,
    private readonly accountService: AccountService
  ) {}

  async confirm(traxData, getInfo): Promise<any> {
    if (traxData.confirm === true || traxData.reverse === true) {
      return this.commonService.Error(getInfo, 15, null, ' ', ' ');
    }
    const confirm = await this.pspverifyService.confirm(traxData.TraxID);
    if (confirm) {
      this.accountService.chargeAccount(traxData.user.id, 'wallet', traxData.discount.bankdisc);
      this.accountService.chargeAccount(traxData.user.id, 'discount', traxData.discount.nonebank);
      const historyData = await this.merchantService.setMerchantTerminalHistoryLog(
        traxData.user._id,
        traxData.terminal.id,
        traxData.discount.nonebank,
        0
      );
      this.merchantService.submitNewMerchantHistory(historyData).then((value) => {});

      const title = 'شارژ کیف پول بابت تخفیف نقدی از فروشگاه ' + traxData.terminal.title;
      this.accountService.accountSetLogg(title, 'BankDisc', traxData.discount.bankdisc, true, null, traxData.user.id);
      const titlenonebank = 'شارژ اعتبار تخفیف در فروشگاه ' + traxData.terminal.title;
      this.accountService.accountSetLogg(
        titlenonebank,
        'NoneBankDisc',
        traxData.discount.nonebank,
        true,
        null,
        traxData.user.id
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

      if (traxData.user.ref) {
        const userwagereftitle = 'شارژ کیف پول بابت ثبت کاربر ' + traxData.user.fullname;
        this.accountService.accountSetLogg(
          userwagereftitle,
          'MerchantWage',
          traxData.discount.cardref,
          true,
          null,
          traxData.user.ref
        );
        this.accountService.chargeAccount(traxData.user.ref, 'wallet', traxData.discount.cardref);
      }

      return this.commonService.setDataCloseLoop(getInfo, null, null, null, 17);
    } else {
      {
        return this.commonService.Error(getInfo, 10, traxData.user.id);
      }
    }
  }
}
