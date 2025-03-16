import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { ShaparakSettlementService } from './settlement.service';
import { ShaparakSettlementProviders } from './settlement.providers';

@Module({
  imports: [DatabaseModule],
  providers: [ShaparakSettlementService, ...ShaparakSettlementProviders],
  exports: [ShaparakSettlementService],
})
export class ShaparakSettlementModule {}
