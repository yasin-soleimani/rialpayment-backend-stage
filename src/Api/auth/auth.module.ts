import { Module } from '@vision/common';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './auth.service';
import { DatabaseModule } from '../../Database/database.module';
import { GeneralService } from '../../Core/service/general.service';
import { LoginController } from './controller/login.controller';
import { ActiveuserController } from './controller/activeuser.controller';
import { ResendController } from './controller/resend.controller';
import { ForgetController } from './controller/forget.controller';
import { VerifyCodeController } from './controller/verify.controller';
import { NewPasswordController } from './controller/newpassword.controller';
import { CardmanagementcoreModule } from '../../Core/cardmanagement/cardmanagementcore.module';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { UserApiService } from './userapi.service';
import { GroupCoreModule } from '../../Core/group/group.module';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { LoggedinService } from './loggedin.service';
import { AclCoreModule } from '../../Core/acl/acl.module';
import { RegisterUserModule } from '../../Core/useraccount/register/register-user.module';
import { OperatorCoreModule } from '../../Core/useraccount/operator/operator.module';
import { LoginHistoryModule } from '../../Core/useraccount/history/login-history.module';
import { ClubCoreModule } from '../../Core/customerclub/club.module';
import { UserCreditCoreModule } from '../../Core/credit/usercredit/credit-core.module';
import { MessagesCoreModule } from '../../Core/messages/messages.module';
import { SettingsCoreModule } from '../../Core/settings/settings.module';
import { CampaignCoreModule } from '../../Core/campaign/campaign.module';
import { ClubpPwaModule } from '../../Core/clubpwa/club-pwa.module';
import { AuthClubDataService } from './auth-club-data.service';
import { BasketStoreCoreModule } from '../../Core/basket/store/basket-store.module';
import { MipgModule } from '../../Core/mipg/mipg.module';
import { MerchantcoreModule } from '../../Core/merchant/merchantcore.module';

@Module({
  imports: [
    DatabaseModule,
    SettingsCoreModule,
    CardmanagementcoreModule,
    MessagesCoreModule,
    AccountModule,
    GroupCoreModule,
    UserModule,
    AclCoreModule,
    RegisterUserModule,
    AclCoreModule,
    ClubCoreModule,
    OperatorCoreModule,
    LoginHistoryModule,
    UserCreditCoreModule,
    ClubpPwaModule,
    BasketStoreCoreModule,
    MipgModule,
    MerchantcoreModule,
  ],
  controllers: [
    AuthController,
    LoginController,
    ActiveuserController,
    ResendController,
    ForgetController,
    VerifyCodeController,
    NewPasswordController,
  ],
  providers: [AuthService, GeneralService, LoggedinService, UserApiService, AuthClubDataService],
})
export class AuthModule {}
