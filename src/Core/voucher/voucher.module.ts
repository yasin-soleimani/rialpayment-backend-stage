import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { VoucherCommonService } from './services/voucher-common.service';
import { VoucherCoreService } from './voucher.service';
import { VoucherProviders } from './voucher.providers';
import { VoucherQrGenerator } from './services/voucher-qr.service';
import { AccountModule } from '../useraccount/account/account.module';
import { CardcounterModule } from '../useraccount/cardcounter/cardcounter.module';
import { VoucherDetailsCoreService } from './services/voucher.details.service';
import { VoucherListCoreService } from './services/voucher-list.service';

@Module({
  imports: [DatabaseModule, AccountModule, CardcounterModule],
  providers: [
    VoucherCommonService,
    VoucherCoreService,
    VoucherQrGenerator,
    VoucherDetailsCoreService,
    VoucherListCoreService,
    ...VoucherProviders,
  ],
  exports: [
    VoucherCoreService,
    VoucherListCoreService,
    VoucherDetailsCoreService,
    VoucherQrGenerator,
    VoucherCommonService,
  ],
})
export class VoucherModule {}
