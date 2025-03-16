import { Module } from '@vision/common';
import { SwitchMainConfirmService } from './main-confirm.service';
import { SwitchShetabConfirmService } from './shetab-confirm.service';
import { SwitchDiscountConfirmService } from './discount-confirm.service';
import { SwitchCreditConfirmService } from './credit-confirm.service';
import { PayCoreModule } from '../../../../Core/pay/payaction.module';
import { AccountModule } from '../../../../Core/useraccount/account/account.module';
import { PspverifyCoreModule } from '../../../../Core/psp/pspverify/pspverifyCore.module';
import { MerchantcoreModule } from '../../../../Core/merchant/merchantcore.module';
import { TurnOverCoreModule } from '../../../../Core/turnover/turnover.module';

@Module({
  imports: [PayCoreModule, AccountModule, PspverifyCoreModule, MerchantcoreModule, TurnOverCoreModule],
  providers: [
    SwitchMainConfirmService,
    SwitchShetabConfirmService,
    SwitchDiscountConfirmService,
    SwitchCreditConfirmService,
  ],
  exports: [SwitchMainConfirmService],
})
export class SwitchConfirmModule { }
