import { Module } from '@vision/common';
import { BasketCategoryController } from './category.controller';
import { BasketCategoryApiService } from './category.service';
import { BasketCategoryModule } from '../../../Core/basket/category/category.module';
import { GeneralService } from '../../../Core/service/general.service';
import { BasketCategoryControllerV2 } from './category.v2.controller';
import { BasketProductModule } from '../../../Core/basket/products/product.module';

@Module({
  imports: [BasketCategoryModule, BasketProductModule],
  controllers: [BasketCategoryController, BasketCategoryControllerV2],
  providers: [BasketCategoryApiService, GeneralService],
})
export class BasketCategoryApiModule {}
