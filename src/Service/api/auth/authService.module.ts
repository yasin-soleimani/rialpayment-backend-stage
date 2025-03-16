import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { AuthServiceController } from './authService.controller';
import { ApiPermCoreService } from '../../../Core/apiPerm/apiPerm.service';
import { ApiPermProviders } from '../../../Core/apiPerm/apiPerm.providers';
import { AuthServiceService } from './authService.service';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { UserProviders } from '../../../Core/useraccount/user/user.providers';
import { CardcounterService } from '../../../Core/useraccount/cardcounter/cardcounter.service';
import { CardcounterProviders } from '../../../Core/useraccount/cardcounter/cardcounter.providers';
import { GeneralService } from '../../../Core/service/general.service';
import { CardService } from '../../../Core/useraccount/card/card.service';
import { CardProviders } from '../../../Core/useraccount/card/card.providers';
import { CardmanagementcoreService } from '../../../Core/cardmanagement/cardmanagementcore.service';
import { CardmanagementcoreProviders } from '../../../Core/cardmanagement/cardmanagementcore.providers';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { AccountModule } from '../../../Core/useraccount/account/account.module';
import { UserModule } from '../../../Core/useraccount/user/user.module';
import { UserCreditCoreModule } from '../../../Core/credit/usercredit/credit-core.module';

@Module({
  imports: [DatabaseModule, AccountModule, UserModule, UserCreditCoreModule],
  controllers: [AuthServiceController],
  providers: [
    CardService,
    CardcounterService,
    ApiPermCoreService,
    AuthServiceService,
    CardcounterService,
    GeneralService,
    CardmanagementcoreService,
    ...CardmanagementcoreProviders,
    ...CardcounterProviders,
    ...ApiPermProviders,
    ...CardcounterProviders,
    ...CardProviders,
  ],
})
export class AuthServiceModule {}
