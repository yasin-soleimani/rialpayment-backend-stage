import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { leasingInfoProviders } from './leasing-info.providers';
import { LeasingInfoCoreService } from './leasing-info.service';

@Module({
  imports: [DatabaseModule],
  providers: [LeasingInfoCoreService, ...leasingInfoProviders],
  exports: [LeasingInfoCoreService],
})
export class LeasingInfoCoreModule {}
