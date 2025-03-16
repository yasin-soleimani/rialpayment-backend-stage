import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { CreditHistoryCoreService } from './credit-history.service';
import { CreditHistoryProviders } from './credit-history.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [CreditHistoryCoreService, ...CreditHistoryProviders],
  exports: [CreditHistoryCoreService],
})
export class CreditHistoryCoreModule {}
