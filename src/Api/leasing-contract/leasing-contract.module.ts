import { Module } from '@vision/common';
import { LeasingContractCoreModule } from '../../Core/leasing-contract/leasing-contract.module';
import { LeasingRefCoreModule } from '../../Core/leasing-ref/leasing-ref.module';
import { GeneralService } from '../../Core/service/general.service';
import { LeasingContractController } from './leasing-contract.controller';
import { LeasingContractService } from './leasing-contract.service';

@Module({
  imports: [LeasingContractCoreModule, LeasingRefCoreModule],
  controllers: [LeasingContractController],
  providers: [LeasingContractService, GeneralService],
})
export class LeasingContractApiModule {}
