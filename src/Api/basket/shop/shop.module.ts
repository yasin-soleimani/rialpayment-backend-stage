import { Module } from '@vision/common';
import { BasketShopModule } from '../../../Core/basket/shop/shop.module';
import { BasketApiShopController } from './shop.controller';
import { BasketApiShopService } from './shop.service';
import { GeneralService } from '../../../Core/service/general.service';
import { BasketProductsCardsCoreModule } from '../../../Core/basket/cards/cards.module';
import { BasketProductModule } from '../../../Core/basket/products/product.module';
import { ExportJsService } from './services/export-js.service';

@Module({
  imports: [BasketShopModule, BasketProductsCardsCoreModule, BasketProductModule],
  controllers: [BasketApiShopController],
  providers: [BasketApiShopService, GeneralService, ExportJsService],
  exports: [],
})
export class BasketApiShopModule {}
