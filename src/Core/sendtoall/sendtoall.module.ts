import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { SendtoallCoreService } from './sendtoall.service';
import { SendtoallProvides } from './sendtoall.providers';
import { ClubCoreModule } from '../customerclub/club.module';
import { GeneralService } from '../service/general.service';
import { SendtoAllAgentService } from './services/agent.service';
import { SendtoallCustomerclubService } from './services/customerclub.service';
import { UserModule } from '../useraccount/user/user.module';
import { SendtoallCommonService } from './services/common.service';
import { AccountModule } from '../useraccount/account/account.module';
import { SendToAllCoreBackofficeService } from './services/backoffice.service';

@Module({
  imports: [DatabaseModule, ClubCoreModule, UserModule, AccountModule],
  providers: [
    SendtoallCoreService,
    SendtoAllAgentService,
    SendtoallCommonService,
    SendtoallCustomerclubService,
    SendToAllCoreBackofficeService,
    ...SendtoallProvides,
    GeneralService,
  ],
  exports: [SendtoallCoreService, SendToAllCoreBackofficeService, SendtoallCommonService],
})
export class SendtoallModule { }
