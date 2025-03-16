import { Module } from '@vision/common';
import { NewIpgCoreService } from './newIpg.service';
import { NewIpgCoreProviders } from './newIpg.providers';
import { DatabaseModule } from '../../Database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [NewIpgCoreService, ...NewIpgCoreProviders],
  exports: [],
})
export class NewIpgCoreModule {}
