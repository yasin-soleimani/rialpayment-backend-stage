import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { leasingRefCoreProviders } from './leasing-ref.providers';
import { LeasingRefCoreService } from './leasing-ref.service';

@Module({
  imports: [DatabaseModule],
  providers: [LeasingRefCoreService, ...leasingRefCoreProviders],
  exports: [LeasingRefCoreService],
})
export class LeasingRefCoreModule {}
