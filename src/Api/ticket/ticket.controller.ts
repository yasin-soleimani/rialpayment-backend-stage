import { Body, Controller, Get, Post, Req } from '@vision/common';
import { TicketApiService } from './ticket.service';
import { GeneralService } from '../../Core/service/general.service';
import { Roles } from '../../Guard/roles.decorations';

@Controller('tickets')
export class TicketApiController {
  constructor(private readonly ticketsApiService: TicketApiService, private readonly generalService: GeneralService) {}

  @Get('history')
  async getLastTransactions(@Req() req) {
    const user = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return this.ticketsApiService.getLastTransactions(user, page ?? 1);
  }

  @Get('charges')
  async getLastChargesByUser(@Req() req) {
    const user = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return this.ticketsApiService.getLastChargesByUser(user, page ?? 1);
  }

  @Post('share')
  @Roles('customerclub', 'agent')
  async shareCharge(@Req() req, @Body() body) {
    const user = await this.generalService.getUserid(req);
    return this.ticketsApiService.shareTerminals(body, user);
  }

  @Post('decharge')
  @Roles('customerclub', 'agent')
  async deCharge(@Req() req, @Body() body) {
    const user = await this.generalService.getUserid(req);
    return this.ticketsApiService.deCharge(body, user);
  }
}
