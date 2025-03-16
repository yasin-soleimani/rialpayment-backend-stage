import { Module } from '@vision/common';
import { CheckoutController } from './checkout.controller';
import { DatabaseModule } from '../../Database/database.module';
import { CheckoutService } from './checkout.service';
import { GeneralService } from '../../Core/service/general.service';
import { CheckoutCoreProviders } from '../../Core/checkout/checkout/checkoutcore.providers';
import { CheckoutCoreService } from '../../Core/checkout/checkout/checkoutcore.service';
import { CardcounterService } from '../../Core/useraccount/cardcounter/cardcounter.service';
import { CardcounterProviders } from '../../Core/useraccount/cardcounter/cardcounter.providers';
import { LoggercoreService } from '../../Core/logger/loggercore.service';
import { LoggercoreProviders } from '../../Core/logger/loggercore.providers';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { CheckoutSubmitCoreModule } from '../../Core/checkout/submit/checkoutsubmitcore.module';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { CheckoutAutomaticModule } from '../../Core/checkout/automatic/checkout-automatic.module';
import { GroupProjectCoreModule } from '../../Core/group-project/group-project.module';
import { BanksCoreModule } from '../../Core/banks/banks.module';

@Module({
  imports: [
    DatabaseModule,
    AccountModule,
    UserModule,
    CheckoutSubmitCoreModule,
    CheckoutAutomaticModule,
    GroupProjectCoreModule,
    BanksCoreModule,
  ],
  controllers: [CheckoutController],
  providers: [
    CheckoutService,
    CheckoutCoreService,
    GeneralService,
    CardcounterService,
    LoggercoreService,
    ...CheckoutCoreProviders,
    ...CardcounterProviders,
    ...LoggercoreProviders,
  ],
})
export class CheckoutModule {}
