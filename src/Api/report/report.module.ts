import { Module } from '@vision/common';
import { ReportController } from './report.controller';
import { LoggercoreModule } from '../../Core/logger/loggercore.module';
import { ReportApiService } from './report.service';
import { GeneralService } from '../../Core/service/general.service';
import { IpgCoreModule } from '../../Core/ipg/ipgcore.module';
import { CheckoutCoreModule } from '../../Core/checkout/checkout/checkoutcore.module';
import { CheckoutSubmitCoreModule } from '../../Core/checkout/submit/checkoutsubmitcore.module';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { MipgModule } from '../../Core/mipg/mipg.module';
import { MerchantcoreModule } from '../../Core/merchant/merchantcore.module';
import { PspverifyCoreModule } from '../../Core/psp/pspverify/pspverifyCore.module';
import { ReportCashoutService } from './services/report-cashout.service';
import { TicketsCoreModule } from '../../Core/tickets/tickets.module';
import { ReportTicketHistoryExcel } from './services/ticket-excel';
import { GroupReportCoreModule } from '../../Core/group-report/group-report.module';
import { GroupCoreModule } from '../../Core/group/group.module';
import { MerchantSettlementCoreModule } from '../../Core/merchant-settlement/merchant-settlement.module';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { CardModule } from '../../Core/useraccount/card/card.module';

@Module({
  imports: [
    LoggercoreModule,
    IpgCoreModule,
    CheckoutSubmitCoreModule,
    UserModule,
    MipgModule,
    CheckoutSubmitCoreModule,
    MerchantcoreModule,
    PspverifyCoreModule,
    TicketsCoreModule,
    GroupCoreModule,
    GroupReportCoreModule,
    MerchantSettlementCoreModule,
    AccountModule,
    CardModule
  ],
  controllers: [ReportController],
  providers: [ReportApiService, GeneralService, ReportCashoutService, ReportTicketHistoryExcel],
})
export class ReportApiModule {}
