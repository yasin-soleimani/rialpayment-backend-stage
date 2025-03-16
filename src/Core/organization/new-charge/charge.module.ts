import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { OrganizationNewChargeProviders } from './charge.providers';
import { OrganizationNewChargeCoreService } from './charge.service';
import { OrganizationNewChargeCoreAnalyzeService } from './services/analyze.service';
import { OrganizationNewChargeCoreBalanceService } from './services/balance.service';
import { OrganizationNewChargeCoreCommonService } from './services/common.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    ...OrganizationNewChargeProviders,
    OrganizationNewChargeCoreService,
    OrganizationNewChargeCoreCommonService,
    OrganizationNewChargeCoreBalanceService,
    OrganizationNewChargeCoreAnalyzeService,
  ],
  exports: [OrganizationNewChargeCoreService, OrganizationNewChargeCoreAnalyzeService],
})
export class OrganizationNewChargeCoreModule {}
