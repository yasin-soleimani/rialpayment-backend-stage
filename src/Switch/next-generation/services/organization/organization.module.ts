import { Module } from '@vision/common';
import { OrganizationChargeCoreModule } from '../../../../Core/organization/charge/organization-charge.module';
import { OrganizationSwitchService } from './organization.service';
import { InOrganizationChargeSwitchService } from './services/in-organ-charge.service';
import { InTwoWayOrganizationSwitchService } from './services/in-twice.service';
import { InWalletOrganStrategySwitchService } from './services/in-wallet-mode.service';
import { PayCoreModule } from '../../../../Core/pay/payaction.module';
import { AccountModule } from '../../../../Core/useraccount/account/account.module';

@Module({
  imports: [OrganizationChargeCoreModule, PayCoreModule, AccountModule],
  providers: [
    OrganizationSwitchService,
    InOrganizationChargeSwitchService,
    InTwoWayOrganizationSwitchService,
    InWalletOrganStrategySwitchService,
  ],
  exports: [OrganizationSwitchService],
})
export class OrganizationSwitchModule {}
