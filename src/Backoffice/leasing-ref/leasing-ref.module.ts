import { Module } from '@vision/common';
import { AclCoreModule } from '../../Core/acl/acl.module';
import { LeasingRefCoreModule } from '../../Core/leasing-ref/leasing-ref.module';
import { GeneralService } from '../../Core/service/general.service';
import { BackofficeLeasingRefController } from './leasing-ref.controller';
import { BackofficeLeasingRefService } from './leasing-ref.service';
import { BackofficeLeasingRefQueryBuilderService } from './utils/leasing-ref-query-builders.service';
import { BackofficeLeasingRefValidatorsService } from './utils/leasing-ref-validators.service';
import { LeasingContractCoreModule } from "../../Core/leasing-contract/leasing-contract.module"

@Module({
  imports: [LeasingRefCoreModule, AclCoreModule, LeasingContractCoreModule],
  controllers: [BackofficeLeasingRefController],
  providers: [
    BackofficeLeasingRefService,
    GeneralService,
    BackofficeLeasingRefQueryBuilderService,
    BackofficeLeasingRefValidatorsService,
  ],
})
export class BackofficeLeasingRefModule {}
