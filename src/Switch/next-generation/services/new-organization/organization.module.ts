import { Module } from '@vision/common';
import { OrganizationCorePoolModule } from '../../../../Core/organization/pool/pool. module';
import { OrganizationNewChargeCoreModule } from '../../../../Core/organization/new-charge/charge.module';
import { AccountModule } from '../../../../Core/useraccount/account/account.module';
import { UserModule } from '../../../../Core/useraccount/user/user.module';
import { NewOrganizationSwitchService } from './organization.service';
import { NewOrganizationSwitchCommonService } from './services/common.service';
import { NewOrganizationSwitchGiftCardService } from './services/gift-card.service';
import { CardModule } from '../../../../Core/useraccount/card/card.module';
import { CommonModule } from '../common/common.module';
import { PayCoreModule } from '../../../../Core/pay/payaction.module';
import { MerchantcoreModule } from '../../../../Core/merchant/merchantcore.module';
import { GroupCoreModule } from '../../../../Core/group/group.module';
import { NewOrganizationSwitchUserCardService } from './services/user-card.service';
import { LoggercoreModule } from '../../../../Core/logger/loggercore.module';
import { GeneralService } from '../../../../Core/service/general.service';
import { TurnOverCoreModule } from '../../../../Core/turnover/turnover.module';

@Module({
  imports: [
    OrganizationNewChargeCoreModule,
    OrganizationCorePoolModule,
    AccountModule,
    UserModule,
    CardModule,
    CommonModule,
    PayCoreModule,
    MerchantcoreModule,
    GroupCoreModule,
    LoggercoreModule,
    TurnOverCoreModule,
  ],
  providers: [
    NewOrganizationSwitchService,
    NewOrganizationSwitchCommonService,
    NewOrganizationSwitchGiftCardService,
    NewOrganizationSwitchUserCardService,
    GeneralService,
  ],
  exports: [NewOrganizationSwitchService, NewOrganizationSwitchCommonService],
})
export class NewOrganizationSwitchModule {}
