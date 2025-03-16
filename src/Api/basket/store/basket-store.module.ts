import { Module } from '@vision/common';
import { BasketStoreCoreModule } from '../../../Core/basket/store/basket-store.module';
import { BasketStoreController } from './basket-store.controller';
import { BasketStoreApiService } from './basket-store.service';
import { GeneralService } from '../../../Core/service/general.service';
import { MipgModule } from '../../../Core/mipg/mipg.module';
import { BasketDeliveryTimeCoreModule } from '../../../Core/basket/delivery-time/delivery-time.module';

@Module({
  imports: [BasketStoreCoreModule, MipgModule, BasketDeliveryTimeCoreModule],
  controllers: [BasketStoreController],
  providers: [BasketStoreApiService, GeneralService],
  exports: [],
})
export class BasketStoreApiModule {}
