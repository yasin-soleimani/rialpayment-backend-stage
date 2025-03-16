import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { CategorycoreProviders } from '../../Core/category/categorycore.providers';
import { CategorycoreService } from '../../Core/category/categorycore.service';
import { CategoryService } from './category.servicce';
import { CategoryController } from './category.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [CategoryController],
  providers: [CategorycoreService, CategoryService, ...CategorycoreProviders],
})
export class CategoryModule {}
