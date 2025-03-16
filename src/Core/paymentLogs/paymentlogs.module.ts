import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { PaymentLogsProviders } from './paymentlogs.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [...PaymentLogsProviders],
})
export class PaymentLogsModule {}
