import { Module } from '@vision/common';
import { UserModule } from '../user/user.module';
import { CardModule } from '../card/card.module';
import { AccountModule } from '../account/account.module';
import { RegisterUserService } from './resgiter-user.service';
import { GeneralService } from '../../service/general.service';
import { RegisterUserInService } from './services/register-user.service';
import { RegisterOperatorInService } from './services/register-operator.service';
import { RegisterCommonInService } from './services/register-common.service';
import { GroupCoreModule } from '../../group/group.module';
import { CardmanagementcoreModule } from '../../cardmanagement/cardmanagementcore.module';
import { CardcounterModule } from '../cardcounter/cardcounter.module';
import { NationalCoreModule } from '../../national/national.module';
import { ClubCoreModule } from '../../../Core/customerclub/club.module';

@Module({
  imports: [
    UserModule,
    NationalCoreModule,
    CardModule,
    AccountModule,
    ClubCoreModule,
    GroupCoreModule,
    CardmanagementcoreModule,
    CardcounterModule,
  ],
  providers: [
    RegisterUserService,
    RegisterUserInService,
    RegisterOperatorInService,
    RegisterCommonInService,
    GeneralService,
  ],
  exports: [RegisterUserService],
})
export class RegisterUserModule {}
