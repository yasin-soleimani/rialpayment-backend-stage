import { Module } from '@vision/common';
import { SettingsCoreModule } from '../../Core/settings/settings.module';
import { DeveloperApiController } from './developer.controller';
import { DeveloperApiService } from './developer.service';
import { GeneralService } from '../../Core/service/general.service';
import { DeveloperAuthorizeApiController } from './controller/authorize.controller';
import { DeveloperAuthorizeApiService } from './services/authorize.service';
import { AuthorizeUserCoreModule } from '../../Core/authorize/user/user.module';

@Module({
  imports: [SettingsCoreModule, AuthorizeUserCoreModule],
  controllers: [DeveloperApiController, DeveloperAuthorizeApiController],
  providers: [DeveloperApiService, DeveloperAuthorizeApiService, GeneralService],
})
export class DeveloperApiModule {}
