import { Module } from '@vision/common';
import { PspCoreService } from './pspCore.service';
import { PspCoreProviders } from './pspCore.providers';
import { DatabaseModule } from '../../../Database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [PspCoreService, ...PspCoreProviders],
  exports: [PspCoreService],
})
export class PspCoreModule {}
