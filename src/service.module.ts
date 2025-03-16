import { Module } from '@vision/common';
import { MipgServiceModule } from './Service/mipg/mipg.module';
import { PspModule } from './Service/psp/psp.module';
import { AuthServiceModule } from './Service/api/auth/authService.module';
import { SitadApiModule } from './Service/api/sitad/sitad.module';
import { ParkingServiceModule } from './Service/parking/parking.module';
import { OperatorServiceModule } from './Service/operator/operator.module';
import { TicketServiceModule } from './Service/ticket/ticket.module';
import { IpgFactoryModeul } from './Service/ipg/ipg.module';
import { SafeVoucherServiceModule } from './Service/voucehr/voucher.module';
import { MplModule } from './Service/mpl/mpl.module';
import { NahabModule } from './Service/api/nahab/nahab.module';
import { PostServiceModule } from './Service/api/post/post.module';
import { AsnafServiceModule } from './Service/api/asnaf/asnaf.module';
import { AuthorizeAccountServiceModule } from './Service/account/account.module';
import { ChargeServiceModule } from './Service/charge/charge.module';
import { CardTransServiceModule } from './Service/api/cardTrans/cardTrans.module';
import { ServiceMrsModule } from './Service/mrs/mrs.module';
import { InternetPaymentGatewayServiceModule } from './Service/internet-payment-gateway/ipg.module';
import { PosServiceModule } from './Service/pos/pos.module';
import { SocketServiceModule } from './Service/socket/socket.moduke';
import { TokenModule } from './Core/useraccount/token/token.module';
import { GiftCardServiceModule } from './Service/giftcard/giftcard.module';
import { TicketsServiceModule } from './Service/tickets/ticket.module';

@Module({
  imports: [
    TokenModule,
    SocketServiceModule,
    PosServiceModule,
    PostServiceModule,
    CardTransServiceModule,
    ChargeServiceModule,
    AsnafServiceModule,
    MipgServiceModule,
    AuthorizeAccountServiceModule,
    NahabModule,
    PspModule,
    MplModule,
    SafeVoucherServiceModule,
    AuthServiceModule,
    SitadApiModule,
    ParkingServiceModule,
    OperatorServiceModule,
    IpgFactoryModeul,
    TicketServiceModule,
    ServiceMrsModule,
    InternetPaymentGatewayServiceModule,
    GiftCardServiceModule,
    TicketsServiceModule,
  ],
})
export class WebserviceModule {}
