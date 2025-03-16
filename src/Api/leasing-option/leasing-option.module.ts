import { Module } from '@vision/common';
import { AclCoreModule } from '../../Core/acl/acl.module';
import { LeasingOptionCoreModule } from '../../Core/leasing-option/leasing-option.module';
import { GeneralService } from '../../Core/service/general.service';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { LeasingContractCoreModule } from '../../Core/leasing-contract/leasing-contract.module';
import { LeasingFormCoreModule } from '../../Core/leasing-form/leasing-form.module';
import { LeasingRefCoreModule } from '../../Core/leasing-ref/leasing-ref.module';
import { MerchantcoreModule } from '../../Core/merchant/merchantcore.module';
import { LeasingOptionController } from './leasing-option.controller';
import { LeasingOptionService } from './leasing-option.service';
import { LeasingOptionUtilityService } from './services/leasing-option-utility.service';

@Module({
  imports: [
    LeasingOptionCoreModule,
    AclCoreModule,
    UserModule,
    LeasingFormCoreModule,
    LeasingRefCoreModule,
    MerchantcoreModule,
    LeasingContractCoreModule,
  ],
  controllers: [LeasingOptionController],
  providers: [LeasingOptionService, LeasingOptionUtilityService, GeneralService],
})
export class LeasingOptionApiModule {}
