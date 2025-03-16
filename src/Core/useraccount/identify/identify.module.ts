import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { IdentifyCoreService } from './identify.service';
import { IdentifyProviders } from './identify.providers';
import { IdentifyRejectCoreService } from './services/reject.service';

@Module({
  imports: [DatabaseModule],
  providers: [IdentifyCoreService, IdentifyRejectCoreService, ...IdentifyProviders],
  exports: [IdentifyCoreService, IdentifyRejectCoreService],
})
export class IdentifyCoreModule {}
