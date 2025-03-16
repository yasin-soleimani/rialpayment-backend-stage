import { Injectable, CreditStatusEnums } from '@vision/common';
import { PspverifyCoreService } from '../../../../Core/psp/pspverify/pspverifyCore.service';
import { PayCommonService } from '../../../../Core/pay/services/pay-common.service';
import { MerchantcoreService } from '../../../../Core/merchant/merchantcore.service';
import { AccountService } from '../../../../Core/useraccount/account/account.service';
import * as UniqueNumber from 'unique-number';
import { NewSwitchDto } from '../../../dto/new-switch.dto';
import { LoggercoreService } from '../../../../Core/logger/loggercore.service';

@Injectable()
export class SwitchDiscountConfirmService {
  constructor(
    private readonly pspverifyService: PspverifyCoreService,
    private readonly commonService: PayCommonService,
    private readonly merchantService: MerchantcoreService,
    private readonly accountService: AccountService,
    private readonly loggerService: LoggercoreService
  ) {}

  async confirm(dataInfo, getInfo: NewSwitchDto): Promise<any> {
    if (dataInfo.confirm === true || dataInfo.reverse === true) {
      return this.commonService.Error(getInfo, 15, null, ' ', ' ');
    }
    const confirm = await this.pspverifyService.confirm(dataInfo.TraxID);
    if (confirm) {
      // set user wages
      this.accountService.chargeAccount(dataInfo.user.id, 'wallet', dataInfo.discount.bankdisc).then((value) => {});
      this.accountService.chargeAccount(dataInfo.user.id, 'discount', dataInfo.discount.nonebank).then((value) => {});
      const historyData = await this.merchantService.setMerchantTerminalHistoryLog(
        dataInfo.user.id,
        dataInfo.terminal.id,
        dataInfo.discount.nonebank,
        0
      );
      this.merchantService.submitNewMerchantHistory(historyData).then((value) => {});
      const uniqueNumber = new UniqueNumber(true);

      // set merchant amount & logg
      this.accountService.chargeAccount(dataInfo.terminal.merchant.user, 'wallet', dataInfo.discount.amount);
      const mtitle = 'خرید از شماره پایانه ' + dataInfo.terminal.terminalid;
      const mref = 'Pos-' + uniqueNumber.generate();
      const mlog = this.loggerService.setLogg(
        mtitle,
        mref,
        dataInfo.discount.amount,
        true,
        dataInfo.terminal.merchant.user,
        dataInfo.terminal.merchant.user
      );
      await this.loggerService.newLogg(mlog);

      // submit user loggs
      const title = 'شارژ کیف پول بابت تخفیف نقدی از فروشگاه ' + dataInfo.terminal.title;
      const ref = 'BankDisc-' + uniqueNumber.generate();
      const bankdisclog = this.loggerService.setLogg(
        title,
        ref,
        dataInfo.discount.bankdisc,
        true,
        dataInfo.user.id,
        dataInfo.user.id
      );
      const titlenonebank = 'شارژ اعتبار تخفیف در فروشگاه ' + dataInfo.terminal.title;
      const refnonbank = 'NoneDisc-' + uniqueNumber.generate();
      const nonbankdisclog = this.loggerService.setLogg(
        titlenonebank,
        refnonbank,
        dataInfo.discount.nonebank,
        true,
        dataInfo.user.id,
        dataInfo.user.id
      );
      await this.loggerService.newLogg(bankdisclog);
      await this.loggerService.newLogg(nonbankdisclog);

      // set Reffer Wage & Loggs
      const merchantwagereftitle = 'شارژ کیف پول بابت ثبت فروشگاه ' + dataInfo.terminal.title;
      const merchantwageref = 'MerchantWage-' + uniqueNumber.generate();
      const merchantwagelog = this.loggerService.setLogg(
        merchantwagereftitle,
        merchantwageref,
        dataInfo.discount.merchantref,
        true,
        null,
        dataInfo.terminal.merchant.ref
      );
      this.loggerService.newLogg(merchantwagelog);
      this.accountService
        .chargeAccount(dataInfo.terminal.merchant.ref, 'wallet', dataInfo.discount.merchantref)
        .then((value) => {
          console.log('user account discount charged');
        });

      // return success
      return this.commonService.setDataCloseLoop(getInfo, null, null, null, 17);
    } else {
      // return problem
      return this.commonService.Error(getInfo, 10, dataInfo.user.id);
    }
  }

  async BalanceInStoreConfirm(dataInfo, getInfo: NewSwitchDto): Promise<any> {
    if (dataInfo.confirm === true || dataInfo.reverse === true) {
      return this.commonService.Error(getInfo, 15, null, ' ', ' ');
    }
    const confirm = await this.pspverifyService.confirm(dataInfo.TraxID);
    if (confirm) {
      const uniqueNumber = new UniqueNumber(true);

      console.log(dataInfo);
      this.accountService.chargeAccount(dataInfo.terminal.merchant.user, 'wallet', dataInfo.discount.amount);
      const mtitle = 'خرید از شماره پایانه ' + dataInfo.terminal.terminalid;
      const mref = 'Pos-' + uniqueNumber.generate();
      const mlog = this.loggerService.setLogg(
        mtitle,
        mref,
        dataInfo.discount.amount,
        true,
        dataInfo.terminal.merchant.user,
        dataInfo.terminal.merchant.user
      );
      await this.loggerService.newLogg(mlog);

      return this.commonService.setDataCloseLoop(getInfo, null, null, null, 17);
    } else {
      {
        return this.commonService.Error(getInfo, 10, dataInfo.user.id);
      }
    }
  }
}
