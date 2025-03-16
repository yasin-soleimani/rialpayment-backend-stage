import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { InternetPaymentGatewayCoreService } from './internet-payment-gateway.service';
import { InternetPaymentGatewayProviders } from './internet-payment-gateway.providers';
@Module({
  imports: [DatabaseModule],
  providers: [InternetPaymentGatewayCoreService, ...InternetPaymentGatewayProviders],
  exports: [InternetPaymentGatewayCoreService],
})
export class InternetPaymentGatewayCoreModue {}
