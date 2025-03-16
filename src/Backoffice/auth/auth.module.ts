import { Module } from '@vision/common';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { GeneralService } from '../../Core/service/general.service';
import { BackofficeAuthController } from './auth.controller';
import { BackofficeAuthService } from './auth.service';

@Module({
  imports: [UserModule],
  controllers: [BackofficeAuthController],
  providers: [GeneralService, BackofficeAuthService],
  exports: [],
})
export class BackofficeAuthModule {}
