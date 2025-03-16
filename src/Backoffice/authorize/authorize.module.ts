import { Module } from '@vision/common';
import { AuthorizeUserCoreModule } from '../../Core/authorize/user/user.module';
import { BackofficeAuthorizeController } from './authorize.controller';
import { BackofficeAuthorizeService } from './authorize.service';
import { GeneralService } from '../../Core/service/general.service';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { BackofficeAuthorizeUserWageService } from './services/authorize-wage.service';

@Module({
  imports: [AuthorizeUserCoreModule, UserModule],
  controllers: [BackofficeAuthorizeController],
  providers: [GeneralService, BackofficeAuthorizeService, BackofficeAuthorizeUserWageService],
})
export class BackofficeAuthorizeModule {}
