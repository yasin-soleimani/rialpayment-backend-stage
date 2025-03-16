import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { CheckoutAutomaticService } from './checkout-automatic.service';
import { CheckoutAutomaticProviders } from './checkout-automatic.providers';
import { CheckoutCoreModule } from '../checkout/checkoutcore.module';

@Module({
  imports: [DatabaseModule, CheckoutCoreModule],
  providers: [CheckoutAutomaticService, ...CheckoutAutomaticProviders],
  exports: [CheckoutAutomaticService],
})
export class CheckoutAutomaticModule {}
