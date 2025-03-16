import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { SitadCoreService } from './sitad.service';
import { SitadCoreProviders } from './sitad.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [SitadCoreService, ...SitadCoreProviders],
})
export class SitadCoreModule {}
