import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { leasingApplyProviders } from './leasing-apply.providers';
import { LeasingApplyCoreService } from './leasing-apply.service';

@Module({
  imports: [DatabaseModule],
  providers: [LeasingApplyCoreService, ...leasingApplyProviders],
  exports: [LeasingApplyCoreService],
})
export class LeasingApplyCoreModule {}
