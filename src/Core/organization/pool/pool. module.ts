import { Module } from '@vision/common';
import { GroupCoreModule } from '../../../Core/group/group.module';
import { DatabaseModule } from '../../../Database/database.module';
import { OrganizationPoolProviders } from './pool.providers';
import { OrganizationPoolCoreService } from './pool.service';
import { OrganizationPoolCoreBalanceService } from './services/balance.service';
import { OrganizationPoolCoreCommonService } from './services/common.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    ...OrganizationPoolProviders,
    OrganizationPoolCoreCommonService,
    OrganizationPoolCoreBalanceService,
    OrganizationPoolCoreService,
  ],
  exports: [OrganizationPoolCoreService, OrganizationPoolCoreCommonService],
})
export class OrganizationCorePoolModule { }
