import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { SepidApiService } from './services/sepid-api.service';
import { taxiProviders } from './taxi.providers';
import { TaxiCoreService } from './taxi.service';

@Module({
  imports: [DatabaseModule],
  providers: [TaxiCoreService, SepidApiService, ...taxiProviders],
  exports: [TaxiCoreService, SepidApiService, ...taxiProviders],
})
export class TaxiCoreModule {}
