import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { AclCoreModule } from '../acl/acl.module';
import { leasingContractProviders } from './leasing-contract.providers';
import { LeasingContractCoreService } from './leasing-contract.service';
import { LeasingContractUtilityService } from './services/leasing-contract-utility.service';

@Module({
  imports: [DatabaseModule, AclCoreModule],
  providers: [LeasingContractCoreService, LeasingContractUtilityService, ...leasingContractProviders],
  exports: [LeasingContractCoreService, LeasingContractUtilityService],
})
export class LeasingContractCoreModule {}
