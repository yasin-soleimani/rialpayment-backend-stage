import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { BaksetCategoryService } from './category.service';
import { BasketCategoryProviders } from './category.providers';

@Module({
  imports: [DatabaseModule],
  providers: [BaksetCategoryService, ...BasketCategoryProviders],
  exports: [BaksetCategoryService],
})
export class BasketCategoryModule {}
