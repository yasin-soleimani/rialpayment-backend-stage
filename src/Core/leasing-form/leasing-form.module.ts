import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { LeasingFormProviders } from './leasing-form-providers';
import { LeasingFormCoreService } from './leasing-form.service';

@Module({
  imports: [DatabaseModule],
  providers: [LeasingFormCoreService, ...LeasingFormProviders],
  exports: [LeasingFormCoreService],
})
export class LeasingFormCoreModule {}
