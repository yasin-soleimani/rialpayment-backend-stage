import { Module } from '@vision/common';
import { PaymentService } from './payment.service';
import { DatabaseModule } from '../../Database/database.module';
import { GeneralService } from '../../Core/service/general.service';
import { PaymentController } from './payment.controller';
import { CardcounterService } from '../../Core/useraccount/cardcounter/cardcounter.service';
import { CardcounterProviders } from '../../Core/useraccount/cardcounter/cardcounter.providers';
import { LoggercoreService } from '../../Core/logger/loggercore.service';
import { LoggercoreProviders } from '../../Core/logger/loggercore.providers';
import { SafeboxCoreService } from '../../Core/safebox/safebox.sevice';
import { SafeboxProviders } from '../../Core/safebox/safebox.providers';
import { CreditHistoryCoreModule } from '../../Core/credit/history/credit-history.module';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { NewQrPaymentService } from './services/new-qr-payment.service';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { CardModule } from '../../Core/useraccount/card/card.module';
import { MobileSwitchModule } from '../../Switch/next-generation/services/mobile/mobile-switch.module';
import { MerchantcoreModule } from '../../Core/merchant/merchantcore.module';
import { NewPaymentService } from './services/new-payment.service';
import { TerminalPaymentService } from './services/terminal-payment.service';
import { SwitchModule } from '../../Switch/next-generation/switch.module';
import { PspverifyCoreModule } from '../../Core/psp/pspverify/pspverifyCore.module';
import { LoggercoreModule } from '../../Core/logger/loggercore.module';
import { CardcounterModule } from '../../Core/useraccount/cardcounter/cardcounter.module';
import { PaymentsService } from './services/payments.service';
import { PaymentCommonService } from './services/payment-common.service';
import { VoucherModule } from '../../Core/voucher/voucher.module';
import { PaymentGenerateQrService } from './services/genarate-qr.service';
import { PaymentOrganizationService } from './services/payment-organization.service';
import { PaymentSafeService } from './services/payment-safe.service';
import { IpgCoreModule } from '../../Core/ipg/ipgcore.module';
import { MipgServiceModule } from '../../Service/mipg/mipg.module';
import { PaymentRfidService } from './services/rfid-payment.service';
import { PaymentInformationApiService } from './services/info.service';
import { PaymentCarsTransApiService } from './services/cardTrans.service';
import { GroupProjectCoreModule } from '../../Core/group-project/group-project.module';
import { PaymentGroupProjectApiService } from './services/group-project.service';
import { TaxiApiModule } from '../taxi/taxi.module';
import { TicketsServiceModule } from '../../Service/tickets/ticket.module';
import { TicketsCoreModule } from '../../Core/tickets/tickets.module';

@Module({
  imports: [
    DatabaseModule,
    CreditHistoryCoreModule,
    AccountModule,
    MobileSwitchModule,
    UserModule,
    CardModule,
    GroupProjectCoreModule,
    MerchantcoreModule,
    SwitchModule,
    PspverifyCoreModule,
    LoggercoreModule,
    CardcounterModule,
    VoucherModule,
    MipgServiceModule,
    IpgCoreModule,
    TaxiApiModule,
    TicketsServiceModule,
    TicketsCoreModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentSafeService,
    PaymentInformationApiService,
    PaymentCarsTransApiService,
    GeneralService,
    LoggercoreService,
    GeneralService,
    CardcounterService,
    SafeboxCoreService,
    PaymentsService,
    PaymentCommonService,
    PaymentOrganizationService,
    PaymentGenerateQrService,
    PaymentGroupProjectApiService,
    PaymentRfidService,
    ...LoggercoreProviders,
    ...CardcounterProviders,
    ...SafeboxProviders,
    NewQrPaymentService,
    NewPaymentService,
    TerminalPaymentService,
  ],
  exports: [NewQrPaymentService, PaymentGroupProjectApiService, SwitchModule, VoucherModule, AccountModule],
})
export class PaymentModule {}
