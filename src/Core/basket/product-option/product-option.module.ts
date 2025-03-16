import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { BasketProductModule } from '../products/product.module';
import { BasketProductOptionProviders } from './product-option.providers';
import { BasketProductOptionCoreService } from './product-option.service';

@Module({
  imports: [DatabaseModule, BasketProductModule],
  providers: [BasketProductOptionCoreService, ...BasketProductOptionProviders],
  exports: [BasketProductOptionCoreService, ...BasketProductOptionProviders],
})
export class BasketProductOptionModule {}
