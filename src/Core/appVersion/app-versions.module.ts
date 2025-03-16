import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { AppVersionsCoreService } from './app-versions.service';
import { AppVersionsProvider } from './app-versions.provider';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [AppVersionsCoreService, ...AppVersionsProvider],
  exports: [AppVersionsCoreService],
})
export class AppVersionsCoreModule {}
