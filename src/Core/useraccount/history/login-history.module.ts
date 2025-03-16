import { Module } from '@vision/common';
import { LoginHistoryService } from './login-history.service';
import { LoginHistoryProviders } from './login-history.providers';
import { DatabaseModule } from '../../../Database/database.module';
import { CampaignCoreModule } from '../../campaign/campaign.module';
import { AccountModule } from '../account/account.module';
import { OrganizationNewChargeCoreModule } from '../../organization/new-charge/charge.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [DatabaseModule, CampaignCoreModule, AccountModule, OrganizationNewChargeCoreModule, UserModule],
  providers: [LoginHistoryService, ...LoginHistoryProviders],
  exports: [LoginHistoryService],
})
export class LoginHistoryModule { }
