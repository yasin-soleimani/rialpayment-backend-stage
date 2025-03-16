import { Controller, Post, Body, Render, Param, Req, Query, Res } from '@vision/common';
import { TicketsService } from './ticket.service';
import { PosPayRequestDto } from '../pos/dto/pay-req.dto';
import { GeneralService } from '../../Core/service/general.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post('payment')
  async payTicket(@Body() getInfo: PosPayRequestDto) {
    return this.ticketsService.payTicket(getInfo);
  }

  @Post('remain')
  async getRemain(@Body() getInfo) {
    return this.ticketsService.getRemain(getInfo.mac, getInfo.cardno);
  }

  @Post('')
  async getTransactions(@Body() getInfo) {
    return this.ticketsService.getTransactions(getInfo.mac, getInfo.start, getInfo.end, getInfo.page ?? 1);
  }
}
