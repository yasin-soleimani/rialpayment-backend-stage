import { Module } from '@vision/common';
import { MerchantcoreModule } from '../../Core/merchant/merchantcore.module';
import { StrategyApiService } from './strategy.service';
import { StrategyApiController } from './strategy.controller';
import { GeneralService } from '../../Core/service/general.service';
import { MerchantCreditCoreModule } from '../../Core/credit/merchantcredit/merchantcredit.module';
import { GroupCoreModule } from '../../Core/group/group.module';
import { OrganizationStrategyModule } from '../../Core/organization/startegy/organization-startegy.module';

@Module({
  imports: [MerchantcoreModule, MerchantCreditCoreModule, GroupCoreModule, OrganizationStrategyModule],
  providers: [StrategyApiService, GeneralService],
  controllers: [StrategyApiController],
})
export class StrategyApiModule {}
