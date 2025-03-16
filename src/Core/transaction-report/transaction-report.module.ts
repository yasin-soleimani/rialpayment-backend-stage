import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { TransactionReportProviders } from './transaction-report.provider';
import { TransactionReportCoreService } from './transaction-report.service';

@Module({
  imports: [DatabaseModule],
  providers: [...TransactionReportProviders, TransactionReportCoreService],
  exports: [TransactionReportCoreService],
})
export class TransactionReportCoreModule {}
