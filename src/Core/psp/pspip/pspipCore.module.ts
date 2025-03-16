import { Module } from '@vision/common';
import { PspipCoreService } from './pspipCore.service';
import { DatabaseModule } from '../../../Database/database.module';
import { PspipCoreProviders } from './pspipCore.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [PspipCoreService, ...PspipCoreProviders],
})
export class PspipCoreModule {}
