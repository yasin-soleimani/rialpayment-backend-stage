import { Module } from '@vision/common';
import { AclCoreModule } from '../../Core/acl/acl.module';
import { LeasingContractCoreModule } from '../../Core/leasing-contract/leasing-contract.module';
import { LeasingInfoCoreModule } from '../../Core/leasing-info/leasing-info.module';
import { LeasingRefCoreModule } from '../../Core/leasing-ref/leasing-ref.module';
import { GeneralService } from '../../Core/service/general.service';
import { LeasingInfoController } from './leasing-info.controller';
import { LeasingInfoService } from './leasing-info.service';
import { LeasingInfoUtilityService } from './services/leasing-info-utils.service';

@Module({
  imports: [LeasingInfoCoreModule, AclCoreModule, LeasingRefCoreModule, LeasingContractCoreModule],
  controllers: [LeasingInfoController],
  providers: [LeasingInfoService, LeasingInfoUtilityService, GeneralService],
  exports: [LeasingInfoUtilityService],
})
export class LeasingInfoApiModule {}
