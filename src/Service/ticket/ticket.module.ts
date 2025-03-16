import { Module } from '@vision/common';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { SafeboxCoreModule } from '../../Core/safebox/safebox.module';
import { ConfirmCoreModule } from '../../Core/confirm/confirm.module';
import { IpgCoreModule } from '../../Core/ipg/ipgcore.module';
import { VoucherModule } from '../../Core/voucher/voucher.module';
import { GeneralService } from '../../Core/service/general.service';
import { TicketGetListService } from './services/ticket-list.service';
import { CardcounterModule } from '../../Core/useraccount/cardcounter/cardcounter.module';
import { TicketDetailsService } from './services/ticket-details.service';
import { InternetPaymentGatewayServiceModule } from '../internet-payment-gateway/ipg.module';
import { TicketPaymentService } from './services/ticket-payment.service';
@Module({
  imports: [
    UserModule,
    AccountModule,
    SafeboxCoreModule,
    ConfirmCoreModule,
    IpgCoreModule,
    VoucherModule,
    CardcounterModule,
    InternetPaymentGatewayServiceModule,
  ],
  controllers: [TicketController],
  providers: [TicketService, TicketGetListService, TicketDetailsService, TicketPaymentService, GeneralService],
  exports: [],
})
export class TicketServiceModule {}
