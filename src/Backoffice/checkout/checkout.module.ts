import { Module } from '@vision/common';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { CheckoutSettingsController } from './checkout.controller';
import { CheckoutBanksCoreModule } from '../../Core/checkout/banks/checkout-banks.module';
import { BackofficeCheckoutAccountController } from './controller/checkout-account.controller';
import { BackofficeCheckoutBanksController } from './controller/checkout-banks.controller';
import { BackofficeCheckoutAccountService } from './services/account.service';
import { BackofficeCheckoutBanksService } from './services/bank.service';

@Module({
  imports: [UserModule, CheckoutBanksCoreModule],
  controllers: [CheckoutSettingsController, BackofficeCheckoutAccountController, BackofficeCheckoutBanksController],
  providers: [BackofficeCheckoutAccountService, BackofficeCheckoutBanksService],
})
export class BackofficeCheckoutSettingsModule {}
