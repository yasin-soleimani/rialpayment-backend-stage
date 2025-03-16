import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { MerchantCreditCoreService } from './merchantcredit.service';
import { merchantCreditProviders } from './merchantcredit.providers';
import { MerchantCreditService } from '../../../Api/merchant/merchant-credit.service';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [MerchantCreditCoreService, ...merchantCreditProviders],
  exports: [MerchantCreditCoreService],
})
export class MerchantCreditCoreModule {}
