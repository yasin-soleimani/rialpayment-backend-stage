import { Module } from '@vision/common';
import { BasketProductModule } from '../../../Core/basket/products/product.module';
import { BasketProductController } from './product.controller';
import { BasketProductApiService } from './product.service';
import { GeneralService } from '../../../Core/service/general.service';
import { BasketProductsCardsCoreModule } from '../../../Core/basket/cards/cards.module';
import { BasketProductOptionModule } from '../../../Core/basket/product-option/product-option.module';
import { BasketProductExcelApiService } from './services/excel.service';
import { BasketCategoryModule } from '../../../Core/basket/category/category.module';
import { BasketProductControllerV2 } from './product.v2.controller';
import { BasketProductExcelHyperApiService } from './services/excel-hyper.service';
import { BasketImagesCoreModule } from '../../../Core/basket/images/images.module';
import { BasketStoreCoreModule } from '../../../Core/basket/store/basket-store.module';

@Module({
  imports: [
    BasketProductModule,
    BasketProductsCardsCoreModule,
    BasketProductOptionModule,
    BasketCategoryModule,
    BasketStoreCoreModule,
    BasketImagesCoreModule,
  ],
  controllers: [BasketProductController, BasketProductControllerV2],
  providers: [BasketProductApiService, BasketProductExcelApiService, BasketProductExcelHyperApiService, GeneralService],
})
export class BasketProductApiModule {}
