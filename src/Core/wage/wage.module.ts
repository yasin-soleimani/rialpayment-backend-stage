import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { WageCoreService } from './wage.service';
import { WageSystemProviders } from './wage.providers';
import { IpgCoreModule } from '../ipg/ipgcore.module';

@Module({
  imports: [DatabaseModule, IpgCoreModule],
  providers: [WageCoreService, ...WageSystemProviders],
  exports: [WageCoreService],
})
export class WageSystemCoreModule {}
