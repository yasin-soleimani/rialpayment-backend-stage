import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { GroupCoreService } from './group.service';
import { GroupCoreProviders } from './group.providers';
import { MerchantcoreModule } from '../merchant/merchantcore.module';
import { UserModule } from '../useraccount/user/user.module';
import { CardModule } from '../useraccount/card/card.module';
import { AccountModule } from '../useraccount/account/account.module';
import { GroupDetailCoreService } from './services/group-detail.service';
import { GroupListCoreService } from './services/group-list.service';
import { GroupCoreDechargeService } from './services/group-decharge.service';
import { OrganizationNewChargeCoreModule } from '../organization/new-charge/charge.module';
import { GroupCoreOrganizationService } from './services/group-organization.service';
import { GroupCoreUsersCardsService } from './services/group-users-card.service';
import { OrganizationCorePoolModule } from '../organization/pool/pool. module';
import { TurnOverCoreModule } from '../turnover/turnover.module';
import { CardProviders } from '../useraccount/card/card.providers';
import { CoreGroupSearch } from './services/group-search.service';
import { TicketsCoreModule } from '../tickets/tickets.module';
import { ClubCoreModule } from '../customerclub/club.module';
import { SettingsCoreModule } from '../settings/settings.module';

@Module({
  imports: [
    DatabaseModule,
    MerchantcoreModule,
    UserModule,
    CardModule,
    AccountModule,
    OrganizationNewChargeCoreModule,
    OrganizationCorePoolModule,
    TurnOverCoreModule,
    TicketsCoreModule,
    SettingsCoreModule,
  ],
  providers: [
    GroupCoreService,
    GroupDetailCoreService,
    GroupListCoreService,
    GroupCoreDechargeService,
    GroupCoreOrganizationService,
    GroupCoreUsersCardsService,
    CoreGroupSearch,
    ...GroupCoreProviders,
    ...CardProviders,
  ],
  exports: [
    CoreGroupSearch,
    GroupCoreService,
    GroupDetailCoreService,
    GroupListCoreService,
    GroupCoreUsersCardsService,
    GroupCoreDechargeService,
  ],
})
export class GroupCoreModule {}
