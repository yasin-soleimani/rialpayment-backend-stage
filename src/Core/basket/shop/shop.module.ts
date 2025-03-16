import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { BasketProductModule } from '../products/product.module';
import { UserModule } from '../../useraccount/user/user.module';
import { BasketShopCoreService } from './service/shop.service';
import { BasketAddressCoreService } from './service/shop-address.service';
import { BasketShopProviders } from './shop.providers';
import { BasketStoreCoreModule } from '../store/basket-store.module';

@Module({
  imports: [DatabaseModule, BasketProductModule, UserModule, BasketStoreCoreModule],
  providers: [BasketShopCoreService, BasketAddressCoreService, ...BasketShopProviders],
  exports: [BasketShopCoreService, BasketAddressCoreService],
})
export class BasketShopModule {}
