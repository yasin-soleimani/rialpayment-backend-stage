import { Module } from '@vision/common';
import { UserService } from './user.service';
import { UserProviders } from './user.providers';
import { DatabaseModule } from '../../../Database/database.module';
import { GeneralService } from '../../service/general.service';
import { LoggercoreModule } from '../../logger/loggercore.module';
import { CardcounterModule } from '../cardcounter/cardcounter.module';
import { AclCoreModule } from '../../acl/acl.module';
import { CampaignCoreModule } from '../../campaign/campaign.module';

@Module({
  imports: [DatabaseModule, LoggercoreModule, CardcounterModule, AclCoreModule],
  controllers: [],
  providers: [UserService, GeneralService, ...UserProviders],
  exports: [UserService],
})
export class UserModule { }
