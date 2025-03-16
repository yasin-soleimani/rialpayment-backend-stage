import { Module } from '@vision/common';
import { CheckoutCoreService } from './checkoutcore.service';
import { CheckoutCoreProviders } from './checkoutcore.providers';
import { DatabaseModule } from '../../../Database/database.module';
import { BanksCoreModule } from '../../../Core/banks/banks.module';

@Module({
  imports: [DatabaseModule, BanksCoreModule],
  controllers: [],
  providers: [CheckoutCoreService, ...CheckoutCoreProviders],
  exports: [CheckoutCoreService],
})
export class CheckoutCoreModule {}
