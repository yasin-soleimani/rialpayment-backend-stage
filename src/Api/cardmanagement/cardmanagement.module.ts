import { Module } from '@vision/common';
import { CardmanagementService } from './cardmanagement.service';
import { DatabaseModule } from '../../Database/database.module';
import { GeneralService } from '../../Core/service/general.service';
import { CardmanagementController } from './cardmanagement.controller';
import { AuthService } from '../auth/auth.service';
import { CardmanagementcoreProviders } from '../../Core/cardmanagement/cardmanagementcore.providers';
import { CardmanagementcoreService } from '../../Core/cardmanagement/cardmanagementcore.service';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { UserCreditCoreModule } from '../../Core/credit/usercredit/credit-core.module';
import { CardModule } from '../../Core/useraccount/card/card.module';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { GroupCoreModule } from '../../Core/group/group.module';
import { MerchantcoreModule } from '../../Core/merchant/merchantcore.module';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    GroupCoreModule,
    AccountModule,
    CardModule,
    UserCreditCoreModule,
    MerchantcoreModule,
  ],
  controllers: [CardmanagementController],
  providers: [
    CardmanagementService,
    GeneralService,
    AuthService,
    CardmanagementcoreService,
    ...CardmanagementcoreProviders,
  ],
})
export class CardmanagementModule {}
