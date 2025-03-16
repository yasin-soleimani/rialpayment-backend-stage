import { Module } from '@vision/common';
import { MerchantcoreModule } from '../../Core/merchant/merchantcore.module';
import { GeneralService } from '../../Core/service/general.service';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { BackofficePosManagementController } from './pos-management.controller';
import { BackofficePosManagementService } from './pos-management.service';

@Module({
  imports: [MerchantcoreModule, UserModule],
  controllers: [BackofficePosManagementController],
  providers: [BackofficePosManagementService, GeneralService],
})
export class BackofficePosManagementModule {}
