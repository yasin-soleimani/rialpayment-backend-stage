import { Module } from '@vision/common';
import { SafeVoucherProviders } from './safevoucher.providers';
import { SafevoucherCoreService } from './safevoucher.service';
import { DatabaseModule } from '../../Database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [...SafeVoucherProviders, SafevoucherCoreService],
  exports: [SafevoucherCoreService],
})
export class SafevoucherCoreModule {}
