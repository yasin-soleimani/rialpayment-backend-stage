import { Module } from '@vision/common';
import { ProfileService } from './profile.service';
import { DatabaseModule } from '../../Database/database.module';
import { GeneralService } from '../../Core/service/general.service';
import { ProfileController } from './profile.controller';
import { AuthService } from '../auth/auth.service';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { UserCreditCoreModule } from '../../Core/credit/usercredit/credit-core.module';

@Module({
  imports: [DatabaseModule, UserModule, UserCreditCoreModule],
  controllers: [ProfileController],
  providers: [ProfileService, GeneralService, AuthService],
})
export class ProfileModule {}
