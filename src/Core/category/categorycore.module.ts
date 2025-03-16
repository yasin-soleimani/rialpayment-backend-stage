import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { CategorycoreProviders } from './categorycore.providers';
import { CategorycoreService } from './categorycore.service';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [CategorycoreService, ...CategorycoreProviders],
})
export class CategorycoreModule {}
