import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { CheckoutBanksAccountCoreService } from './services/bank-account.service';
import { CheckoutBanksCoreService } from './services/banks.service';
import { CheckoutBankProviders } from './checkout-banks.providers';
import { CheckoutCurrentAccountCoreService } from './services/current-acount.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    CheckoutBanksAccountCoreService,
    CheckoutBanksCoreService,
    CheckoutCurrentAccountCoreService,
    ...CheckoutBankProviders,
  ],
  exports: [CheckoutBanksAccountCoreService, CheckoutBanksCoreService, CheckoutCurrentAccountCoreService],
})
export class CheckoutBanksCoreModule {}
