import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { GroupCoreModule } from '../group/group.module';
import { MerchantcoreModule } from '../merchant/merchantcore.module';
import { PspverifyCoreProviders } from '../psp/pspverify/pspverifyCore.providers';
import { TransactionReportCoreModule } from '../transaction-report/transaction-report.module';
import { GroupReportCommonCoreService } from './services/common.service';
import { GroupReportPspCoreService } from './services/psp.service';
import { GroupReportCoreService } from './services/report.service';
import { TicketsCoreModule } from '../tickets/tickets.module';

@Module({
  imports: [DatabaseModule, MerchantcoreModule, GroupCoreModule, TransactionReportCoreModule, TicketsCoreModule],
  providers: [
    ...PspverifyCoreProviders,
    GroupReportCommonCoreService,
    GroupReportCoreService,
    GroupReportPspCoreService,
  ],
  exports: [GroupReportCoreService, GroupReportCommonCoreService, GroupReportPspCoreService],
})
export class GroupReportCoreModule {}
