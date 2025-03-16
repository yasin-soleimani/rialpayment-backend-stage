import { Module } from '@vision/common';
import { CommonModule } from './services/common/common.module';
import { CreditModule } from './services/credit/credit.module';
import { DiscountModule } from './services/discount/discount.module';
import { HybirdModule } from './services/hybrid/hybird.module';
import { SwitchService } from './switch.service';
import { PayCoreModule } from '../../Core/pay/payaction.module';
import { MerchantcoreModule } from '../../Core/merchant/merchantcore.module';
import { SwitchMainService } from './services/main.service';
import { CardModule } from '../../Core/useraccount/card/card.module';
import { CardmanagementcoreModule } from '../../Core/cardmanagement/cardmanagementcore.module';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { SwitchConfirmModule } from './services/confirm/switch-confirm.module';
import { OrganizationChargeCoreModule } from '../../Core/organization/charge/organization-charge.module';
import { OrganizationStrategyModule } from '../../Core/organization/startegy/organization-startegy.module';
import { GroupCoreModule } from '../../Core/group/group.module';
import { OrganizationSwitchModule } from './services/organization/organization.module';
import { UserCreditCoreModule } from '../../Core/credit/usercredit/credit-core.module';
import { PspverifyCoreModule } from '../../Core/psp/pspverify/pspverifyCore.module';
import { NewOrganizationSwitchModule } from './services/new-organization/organization.module';
import { OrganizationCorePoolModule } from '../../Core/organization/pool/pool. module';
import { SwitchLeasingModule } from './services/leasing/leasing.module';

@Module({
  imports: [
    CommonModule,
    CreditModule,
    DiscountModule,
    HybirdModule,
    PayCoreModule,
    MerchantcoreModule,
    CardModule,
    CardmanagementcoreModule,
    AccountModule,
    SwitchConfirmModule,
    OrganizationChargeCoreModule,
    OrganizationStrategyModule,
    UserCreditCoreModule,
    GroupCoreModule,
    OrganizationSwitchModule,
    PspverifyCoreModule,
    NewOrganizationSwitchModule,
    OrganizationCorePoolModule,
    SwitchLeasingModule,
  ],
  providers: [SwitchService, SwitchMainService],
  exports: [SwitchService],
})
export class SwitchModule {}
