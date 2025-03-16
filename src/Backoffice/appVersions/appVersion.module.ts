import { Module } from '@vision/common';
import { GeneralService } from '../../Core/service/general.service';
import { BackofficeAppVersionController } from './appVersion.controller';
import { BackofficeAppVersionService } from './appVersion.service';
import { AppVersionsCoreModule } from '../../Core/appVersion/app-versions.module';

@Module({
  imports: [AppVersionsCoreModule],
  controllers: [BackofficeAppVersionController],
  providers: [GeneralService, BackofficeAppVersionService],
})
export class BackOfficeAppVersionModule {}
