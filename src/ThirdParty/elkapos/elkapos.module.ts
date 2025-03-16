import { Module } from '@vision/common';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { ElkaposMobileChargeService } from './services/mobile-charge.service';
import { ElkaposMobileInternetService } from './services/mobile-internet.service';
import { CommonChargeService } from './services/common.service';

@Module({
  imports: [AccountModule],
  providers: [ElkaposMobileChargeService, ElkaposMobileInternetService, CommonChargeService],
  exports: [ElkaposMobileInternetService, ElkaposMobileChargeService],
})
export class ElkaposThirdPartyModule {}
