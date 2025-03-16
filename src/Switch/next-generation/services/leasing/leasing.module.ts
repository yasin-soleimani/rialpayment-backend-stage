import { Module } from '@vision/common';
import { LeasingOptionCoreModule } from '../../../../Core/leasing-option/leasing-option.module';
import { LeasingUserCreditCoreModule } from '../../../../Core/leasing-user-credit/leasing-user-credit.module';
import { LoggercoreModule } from '../../../../Core/logger/loggercore.module';
import { MerchantcoreModule } from '../../../../Core/merchant/merchantcore.module';
import { OrganizationChargeCoreModule } from '../../../../Core/organization/charge/organization-charge.module';
import { OrganizationStrategyModule } from '../../../../Core/organization/startegy/organization-startegy.module';
import { PayCoreModule } from '../../../../Core/pay/payaction.module';
import { TurnOverCoreModule } from '../../../../Core/turnover/turnover.module';
import { AccountModule } from '../../../../Core/useraccount/account/account.module';
import { SwitchLeasingService } from './leasing.service';
import { SwitchLeasingTerminalBalanceService } from './terminal-balance.service';

@Module({
  imports: [
    LeasingUserCreditCoreModule,
    LeasingOptionCoreModule,
    AccountModule,
    TurnOverCoreModule,
    MerchantcoreModule,
    LoggercoreModule,
    PayCoreModule,
  ],
  providers: [SwitchLeasingService, SwitchLeasingTerminalBalanceService],
  exports: [SwitchLeasingService],
})
export class SwitchLeasingModule {}
