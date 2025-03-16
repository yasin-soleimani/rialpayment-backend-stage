import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { NationalCoreService } from './services/national.service';
import { NationalProviders } from './national.providers';
import { NationalCommonService } from './services/common.service';
import { CardcounterModule } from '../useraccount/cardcounter/cardcounter.module';

@Module({
  imports: [DatabaseModule, CardcounterModule],
  providers: [NationalCoreService, NationalCommonService, ...NationalProviders],
  exports: [NationalCoreService],
})
export class NationalCoreModule {}
