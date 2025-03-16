import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { ConfirmCoreService } from './confirm.service';
import { ConfirmProviders } from './confirm.providers';
import { GeneralService } from '../service/general.service';

@Module({
  imports: [DatabaseModule],
  providers: [ConfirmCoreService, GeneralService, ...ConfirmProviders],
  exports: [ConfirmCoreService],
})
export class ConfirmCoreModule {}
