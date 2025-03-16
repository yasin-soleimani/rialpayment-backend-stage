import { Injectable } from '@vision/common';
import { NewSwitchDto } from '../../dto/new-switch.dto';
import { PayCommonService } from '../../../Core/pay/services/pay-common.service';
import { PspverifyCoreService } from '../../../Core/psp/pspverify/pspverifyCore.service';
import * as UniqueNumber from 'unique-number';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { LoggercoreService } from '../../../Core/logger/loggercore.service';

@Injectable()
export class ShetabSwitchConfirm {
  constructor(
    private readonly commonService: PayCommonService,
    private readonly pspverifyService: PspverifyCoreService,
    private readonly accountService: AccountService,
    private readonly loggerService: LoggercoreService
  ) {}

  async confirm(dataInfo, getInfo: NewSwitchDto): Promise<any> {
    if (dataInfo.confirm === true || dataInfo.reverse === true) {
      return this.commonService.Error(getInfo, 15, null, ' ', ' ');
    }
    const confirm = await this.pspverifyService.confirm(dataInfo.TraxID);
    if (confirm) {
      const uniqueNumber = new UniqueNumber(true);

      this.accountService.chargeAccount(dataInfo.user.id, 'wallet', dataInfo.discount.bankdisc).then((value) => {
        console.log('user account wallet charged');
      });
      this.accountService.chargeAccount(dataInfo.user.id, 'discount', dataInfo.discount.nonebank).then((value) => {
        console.log('user account discount charged');
      });

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

      return this.commonService.setDataCloseLoop(getInfo, null, null, null, 17);
    } else {
      {
        return this.commonService.Error(getInfo, 10, dataInfo.user.id);
      }
    }
  }
}
