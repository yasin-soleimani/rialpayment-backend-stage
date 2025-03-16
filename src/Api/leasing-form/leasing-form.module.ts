import { Module } from '@vision/common';
import { CounterCoreModule } from '../../Core/counter/counter.module';
import { LeasingApplyCoreModule } from '../../Core/leasing-apply/leasing-apply.module';
import { LeasingFormCoreModule } from '../../Core/leasing-form/leasing-form.module';
import { GeneralService } from '../../Core/service/general.service';
import { LeasingInfoApiModule } from '../leasing-info/leasing-info.module';
import { LeasingFormController } from './leasing-form.controller';
import { LeasingFormService } from './leasing-form.service';

@Module({
  imports: [LeasingFormCoreModule, LeasingInfoApiModule, CounterCoreModule, LeasingApplyCoreModule],
  controllers: [LeasingFormController],
  providers: [LeasingFormService, GeneralService],
})
export class LeasingFormApiModule {}
