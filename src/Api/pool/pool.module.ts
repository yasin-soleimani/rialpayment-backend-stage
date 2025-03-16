import { Module } from '@vision/common';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { OrganizationCorePoolModule } from '../../Core/organization/pool/pool. module';
import { PoolApiController } from './pool.controller';
import { PoolApiService } from './pool.service';
import { PoolApiBalanceService } from './services/balance.service';
import { PoolApiCommonService } from './services/common.service';
import { GeneralService } from '../../Core/service/general.service';

@Module({
  imports: [OrganizationCorePoolModule, UserModule, AccountModule],
  controllers: [PoolApiController],
  providers: [GeneralService, PoolApiService, PoolApiBalanceService, PoolApiCommonService],
})
export class PoolApiModule {}
