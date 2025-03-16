import { Module } from '@vision/common';
import { SafevoucherCoreModule } from '../../Core/safevoucher/safevoucher.module';
import { VoucherController } from './voucher.controller';
import { VoucherApiService } from './voucher.service';
import { GeneralService } from '../../Core/service/general.service';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { SettingsCoreModule } from '../../Core/settings/settings.module';
import { VoucherWageApiService } from './service/voucher-wage.service';
import { CardModule } from '../../Core/useraccount/card/card.module';
import { UserModule } from '../../Core/useraccount/user/user.module';

@Module({
  imports: [SafevoucherCoreModule, AccountModule, SettingsCoreModule, CardModule, UserModule],
  controllers: [VoucherController],
  providers: [VoucherApiService, GeneralService, VoucherWageApiService],
  exports: [VoucherWageApiService],
})
export class VoucherApiModule {}
