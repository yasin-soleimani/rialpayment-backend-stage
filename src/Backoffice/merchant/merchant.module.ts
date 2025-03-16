import { Module } from '@vision/common';
import { MerchantService } from './merchant.service';
import { DatabaseModule } from '../../Database/database.module';
import { GeneralService } from '../../Core/service/general.service';
import { MerchantController } from './merchant.controller';
import { MerchantcoreModule } from '../../Core/merchant/merchantcore.module';
import { UserMerchantModule } from '../../Api/merchant/merchant.module';

@Module({
  imports: [DatabaseModule, MerchantcoreModule, UserMerchantModule],
  controllers: [MerchantController],
  providers: [MerchantService, GeneralService],
})
export class MerchantModule {}
