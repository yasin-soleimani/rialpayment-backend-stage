import { Module } from '@vision/common';
import { PaymentCoreService } from './payment.service';
import { PaymentProviders } from './payment.providers';
import { DatabaseModule } from '../../Database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [PaymentCoreService, ...PaymentProviders],
})
export class PaymentModule {}
