import { Module } from '@vision/common';
import { TicketsController } from './ticket.controller';
import { TicketsService } from './ticket.service';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { GeneralService } from '../../Core/service/general.service';
import { CardModule } from '../../Core/useraccount/card/card.module';
import { TicketsCoreModule } from '../../Core/tickets/tickets.module';
import { MerchantcoreModule } from '../../Core/merchant/merchantcore.module';
@Module({
  imports: [UserModule, CardModule, TicketsCoreModule, MerchantcoreModule],
  controllers: [TicketsController],
  providers: [TicketsService, GeneralService],
  exports: [TicketsService],
})
export class TicketsServiceModule {}
