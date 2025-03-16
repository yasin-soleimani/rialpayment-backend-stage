import { Module } from '@vision/common';
import { SafevoucherCoreModule } from '../../Core/safevoucher/safevoucher.module';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { SafeVoucehrServiceController } from './voucher.controller';
import { SafeVoucherWebService } from './voucher.service';
import { GeneralService } from '../../Core/service/general.service';
import { VoucherApiModule } from '../../Api/voucher/voucher.module';
import { IpgCoreModule } from '../../Core/ipg/ipgcore.module';
import { MipgModule } from '../../Core/mipg/mipg.module';

@Module({
  imports: [SafevoucherCoreModule, AccountModule, UserModule, VoucherApiModule, IpgCoreModule, MipgModule],
  controllers: [SafeVoucehrServiceController],
  providers: [SafeVoucherWebService, GeneralService],
  exports: [],
})
export class SafeVoucherServiceModule {}
