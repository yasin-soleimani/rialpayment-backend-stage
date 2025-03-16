import { Module } from '@vision/common';
import { TicketApiController } from './ticket.controller';
import { TicketApiService } from './ticket.service';
import { TicketsCoreModule } from '../../Core/tickets/tickets.module';
import { GeneralService } from '../../Core/service/general.service';
import { GroupCoreModule } from '../../Core/group/group.module';

@Module({
  imports: [TicketsCoreModule, GroupCoreModule],
  controllers: [TicketApiController],
  providers: [TicketApiService, GeneralService],
})
export class TicketApiModule {}
