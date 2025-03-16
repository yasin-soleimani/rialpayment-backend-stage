import { Module } from '@vision/common';
import { HistoryCoreService } from './services/history.service';
import { HistoryProviders } from './history.providers';
import { DatabaseModule } from '../../Database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [HistoryCoreService, ...HistoryProviders],
  exports: [HistoryCoreService],
})
export class HistoryCoreModule {}
