import { Module } from '@vision/common';
import { SwitchCreditService } from './credit.service';
import { MerchantCreditCoreModule } from '../../../../Core/credit/merchantcredit/merchantcredit.module';
import { PayCoreModule } from '../../../../Core/pay/payaction.module';
import { AccountModule } from '../../../../Core/useraccount/account/account.module';
import { MerchantcoreModule } from '../../../../Core/merchant/merchantcore.module';
import { UserCreditCoreModule } from '../../../../Core/credit/usercredit/credit-core.module';
import { SwitchCreditCalcComponent } from './component/calc-credit.component';
import { SwitchCommonCreditComponent } from './component/common.component';
import { SwitchCreditCalcMozarebeCalcComponent } from './component/calc-mozarebe.component';
import { SwitchNewCreditService } from './new-credit.service';

@Module({
  imports: [MerchantCreditCoreModule, PayCoreModule, AccountModule, MerchantcoreModule, UserCreditCoreModule],
  providers: [
    SwitchCreditService,
    SwitchCreditCalcComponent,
    SwitchCreditCalcMozarebeCalcComponent,
    SwitchCommonCreditComponent,
    SwitchNewCreditService,
  ],
  exports: [SwitchCreditService, SwitchNewCreditService],
})
export class CreditModule {}
