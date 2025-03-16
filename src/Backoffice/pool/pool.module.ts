import { Module } from '@vision/common';
import { GeneralService } from '../../Core/service/general.service';
import { OrganizationCorePoolModule } from '../../Core/organization/pool/pool. module';
import { BackofficePoolController } from './pool.controller';
import { BackofficePoolService } from './pool.service';
import { BackofficePoolCommonService } from './services/common.service';
import { BackofficePoolBalanceService } from './services/balance.service';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { BackofficePoolSettingsService } from './services/settings.service';

@Module({
  imports: [OrganizationCorePoolModule, UserModule],
  controllers: [BackofficePoolController],
  providers: [
    BackofficePoolService,
    BackofficePoolCommonService,
    BackofficePoolBalanceService,
    BackofficePoolSettingsService,
    GeneralService,
  ],
})
export class BackofficePoolModule {}
