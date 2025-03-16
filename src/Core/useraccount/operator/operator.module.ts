import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { OperatorCommonService } from './services/common.service';
import { OPeratorCoreService } from './operator.service';
import { OperatorProviders } from './operator.providers';

@Module({
  imports: [DatabaseModule],
  providers: [OperatorCommonService, OPeratorCoreService, ...OperatorProviders],
  exports: [OPeratorCoreService],
})
export class OperatorCoreModule {}
