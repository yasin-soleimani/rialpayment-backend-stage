import { Module } from '@vision/common';
import { PricelistProviders } from './pricelist.providers';
import { PricelistCommonService } from './services/pricelist-common.service';
import { PricelistCoreService } from './pricelist.service';
import { DatabaseModule } from '../../Database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [PricelistCommonService, PricelistCoreService, ...PricelistProviders],
  exports: [PricelistCoreService],
})
export class PricelistCoreModule {}
