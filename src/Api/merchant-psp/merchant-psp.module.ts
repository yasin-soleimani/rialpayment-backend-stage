import { Module } from '@vision/common';
import { MerchantPspCoreModule } from '../../Core/merchant-psp/merchant-psp.module';
import { GeneralService } from '../../Core/service/general.service';
import { MerchantPspApiController } from './merchant-psp.controller';
import { MerchantPspApiService } from './merchant-psp.service';
import { UserModule } from '../../Core/useraccount/user/user.module';

@Module({
  imports: [MerchantPspCoreModule, UserModule],
  controllers: [MerchantPspApiController],
  providers: [GeneralService, MerchantPspApiService],
})
export class MerchantPspApiModule {}
