import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { BasketProductModule } from '../products/product.module';
import { BasketProductCardService } from './cards.service';
import { BasketProductCardProviders } from './cards.providers';

@Module({
  imports: [DatabaseModule, BasketProductModule],
  providers: [BasketProductCardService, ...BasketProductCardProviders],
  exports: [BasketProductCardService],
})
export class BasketProductsCardsCoreModule {}
