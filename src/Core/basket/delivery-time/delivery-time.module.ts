import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { BasketShopModule } from '../shop/shop.module';
import { BasketStoreCoreModule } from '../store/basket-store.module';
import { deliveryTimeProviders } from './delivery-time.providers';
import { DeliveryTimeService } from './delivery-time.service';

@Module({
  imports: [DatabaseModule, BasketStoreCoreModule, BasketShopModule],
  providers: [DeliveryTimeService, ...deliveryTimeProviders],
  exports: [DeliveryTimeService, ...deliveryTimeProviders],
})
export class BasketDeliveryTimeCoreModule {}
