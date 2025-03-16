import { Module } from '@vision/common';
import { AppVersionApiController } from './appVersionApi.controller';
import { AppVersionApiService } from './appVersionApi.service';
import { GeneralService } from '../../Core/service/general.service';
import { AppVersionsCoreModule } from '../../Core/appVersion/app-versions.module';

@Module({
  imports: [AppVersionsCoreModule],
  controllers: [AppVersionApiController],
  providers: [AppVersionApiService, GeneralService],
})
export class AppVersionApiModule {}
