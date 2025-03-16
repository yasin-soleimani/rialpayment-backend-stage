import { Module } from '@vision/common';
import { ShabacoreService } from './shabacore.service';
import { ShabacoreProviders } from './shabacore.providers';
import { DatabaseModule } from '../../Database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [ShabacoreService, ...ShabacoreProviders],
  exports: [ShabacoreService],
})
export class ShabacoreModule {}
