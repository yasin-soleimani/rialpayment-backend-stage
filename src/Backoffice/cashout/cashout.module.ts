import { Module } from '@vision/common';
import { CashoutAutomaticBackofficeController } from './controller/automatic.controller';
import { CashoutAutomaticBackofficeService } from './services/automatic.service';
import { CheckoutAutomaticModule } from '../../Core/checkout/automatic/checkout-automatic.module';
import { GeneralService } from '../../Core/service/general.service';
import { CheckoutBanksCoreModule } from '../../Core/checkout/banks/checkout-banks.module';
import { CashoutAccountsBackofficeController } from './controller/account.controller';
import { CashoutAccountBackofficeService } from './services/accounts.service';

@Module({
  imports: [CheckoutAutomaticModule, CheckoutBanksCoreModule],
  controllers: [CashoutAutomaticBackofficeController, CashoutAccountsBackofficeController],
  providers: [CashoutAutomaticBackofficeService, CashoutAccountBackofficeService, GeneralService],
})
export class CashoutBackofficeModule {}
