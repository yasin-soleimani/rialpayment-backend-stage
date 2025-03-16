import { Module } from '@vision/common';
import { SwitchCommonService } from './common.service';
import { GroupCoreModule } from '../../../../Core/group/group.module';
import { SwitchGetRemainService } from './getremain.service';
import { CardModule } from '../../../../Core/useraccount/card/card.module';
import { MerchantcoreModule } from '../../../../Core/merchant/merchantcore.module';
import { AccountModule } from '../../../../Core/useraccount/account/account.module';
import { PayCoreModule } from '../../../../Core/pay/payaction.module';
import { OrganizationChargeCoreModule } from '../../../../Core/organization/charge/organization-charge.module';
import { UserCreditCoreModule } from '../../../../Core/credit/usercredit/credit-core.module';
import { LeasingUserCreditCoreModule } from '../../../../Core/leasing-user-credit/leasing-user-credit.module';
import { LeasingOptionCoreModule } from '../../../../Core/leasing-option/leasing-option.module';

@Module({
  imports: [
    GroupCoreModule,
    CardModule,
    MerchantcoreModule,
    AccountModule,
    PayCoreModule,
    OrganizationChargeCoreModule,
    UserCreditCoreModule,
    LeasingUserCreditCoreModule,
    LeasingOptionCoreModule,
  ],
  providers: [SwitchCommonService, SwitchGetRemainService],
  exports: [SwitchCommonService],
})
export class CommonModule {}
