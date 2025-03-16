import { Module } from '@vision/common';
import { MerchantPspCoreModule } from '../../Core/merchant-psp/merchant-psp.module';
import { BackofficeMerchantPspController } from './merchant-psp.controller';
import { BackofficeMerchantPspService } from './merchant-psp.service';
import { GeneralService } from '../../Core/service/general.service';
import { UserModule } from '../../Core/useraccount/user/user.module';

// This modules not test in sandbox [test]
@Module({
  imports: [MerchantPspCoreModule, UserModule],
  controllers: [BackofficeMerchantPspController],
  providers: [BackofficeMerchantPspService, GeneralService],
})
export class BackofficeMerchantPspModule {}
