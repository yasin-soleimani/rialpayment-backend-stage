import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { leasingOptionProviders } from './leasing-option.providers';
import { LeasingOptionCoreService } from './leasing-option.service';

@Module({
  imports: [DatabaseModule],
  providers: [LeasingOptionCoreService, ...leasingOptionProviders],
  exports: [LeasingOptionCoreService],
})
export class LeasingOptionCoreModule {}
