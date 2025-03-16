import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { CheckoutSubmitCoreProviders } from './checkoutsubmitcore.providers';
import { CheckoutSubmitCoreService } from './checkoutsubmitcore.service';
import { CardcounterModule } from '../../useraccount/cardcounter/cardcounter.module';
import { AccountModule } from '../../useraccount/account/account.module';
import { UserModule } from '../../useraccount/user/user.module';
import { LoggercoreModule } from '../../logger/loggercore.module';
import { CheckoutCoreModule } from '../checkout/checkoutcore.module';
import { CheckoutSubmitBankService } from './checkout-submit-core-bank.service';
import { CheckoutSubmitCommonService } from './services/submit-common.service';
import { SettingsCoreModule } from '../../../Core/settings/settings.module';
import { GroupProjectCoreModule } from '../../../Core/group-project/group-project.module';
import { CheckoutBanksCoreModule } from '../banks/checkout-banks.module';

@Module({
  imports: [
    DatabaseModule,
    AccountModule,
    UserModule,
    LoggercoreModule,
    CardcounterModule,
    CheckoutCoreModule,
    SettingsCoreModule,
    GroupProjectCoreModule,
    CheckoutBanksCoreModule,
  ],
  controllers: [],
  providers: [
    CheckoutSubmitCoreService,
    CheckoutSubmitBankService,
    CheckoutSubmitCommonService,
    ...CheckoutSubmitCoreProviders,
  ],
  exports: [CheckoutSubmitCoreService, CheckoutSubmitBankService, CheckoutSubmitCommonService],
})
export class CheckoutSubmitCoreModule {}
