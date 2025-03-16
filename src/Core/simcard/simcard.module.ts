import { Module } from '@vision/common';
import { AccountModule } from '../useraccount/account/account.module';
import { SimcardChargeServcie } from './services/charge.service';
import { SimcardCommonCoreService } from './services/common.service';
import { UserModule } from '../useraccount/user/user.module';
import { SimcardProviders } from './simcard.providers';
import { DatabaseModule } from '../../Database/database.module';
import { OrganizationCorePoolModule } from '../organization/pool/pool. module';
import { GroupCoreModule } from '../group/group.module';
import { SimcardChargeOrganizationServcie } from './services/organinzation.service';
import { OrganizationNewChargeCoreModule } from '../organization/new-charge/charge.module';
import { LoggercoreModule } from '../logger/loggercore.module';
import { QPinApiService } from './services/qpin-apis.service';

@Module({
  imports: [
    AccountModule,
    OrganizationCorePoolModule,
    UserModule,
    LoggercoreModule,
    GroupCoreModule,
    OrganizationNewChargeCoreModule,
    DatabaseModule,
  ],
  providers: [
    SimcardChargeServcie,
    SimcardCommonCoreService,
    SimcardChargeOrganizationServcie,
    QPinApiService,
    ...SimcardProviders,
  ],
  exports: [SimcardCommonCoreService, SimcardChargeServcie, QPinApiService],
})
export class SimcardCoreModule {}
