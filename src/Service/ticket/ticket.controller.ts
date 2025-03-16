import { Controller, Post, Get, Body, Render, Param, Req, Query, Res } from '@vision/common';
import { TicketMobileDto } from './dto/ticket-mobile.dto';
import { TicketService } from './ticket.service';
import { ChargeTicketDto } from './dto/charge-dto';
import { TicketGetListService } from './services/ticket-list.service';
import { VoucherTicketSubmitServiceDto } from './dto/submit.dto';
import { TicketDetailsService } from './services/ticket-details.service';
import { TicketPaymentService } from './services/ticket-payment.service';

@Controller('ticket')
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly ticketListService: TicketGetListService,
    private readonly ticketSubmitService: TicketDetailsService,
    private readonly paymentService: TicketPaymentService
  ) {}

  @Post('getmobile')
  async regMobile(@Body() getInfo: TicketMobileDto): Promise<any> {
    console.log(getInfo, 'mehdi');
    return this.ticketService.firstMobile(getInfo.mobile);
  }

  @Post('confirm')
  async confirm(@Body() getInfo: TicketMobileDto): Promise<any> {
    return this.ticketService.confirm(getInfo);
  }

  @Post('payment')
  async payment(@Body() getInfo: TicketMobileDto): Promise<any> {
    return this.ticketService.payment(getInfo);
  }

  @Get('payment/:ref')
  @Render('Charge/charge')
  async redirect(@Param('ref') ref, @Req() req): Promise<any> {
    return this.ticketService.paymenRedirect(ref);
  }

  @Post('payment/status')
  @Render('Charge/ticket-confirm')
  async paymentConfirm(@Body() getInfo: ChargeTicketDto): Promise<any> {
    console.log(getInfo, 'getInfo status ');
    return this.ticketService.confirmPayment(getInfo);
  }

  @Post('get')
  async getTicket(@Body() getInfo): Promise<any> {
    return this.ticketService.getsTick(getInfo.id);
  }

  @Get('list')
  async getTicketLists(): Promise<any> {
    return this.ticketListService.getList();
  }

  @Post('submit')
  async submitTicket(@Body() getInfo: VoucherTicketSubmitServiceDto): Promise<any> {
    return this.ticketSubmitService.submit(getInfo);
  }

  @Get('redirect')
  async getRedirectToIpg(@Query() query, @Res() res): Promise<any> {
    const token = query.token;
    return this.paymentService.getRedirect(token, res);
  }

  @Post('gets')
  async getTick(@Body() getInfo): Promise<any> {
    return this.ticketService.getsTick(getInfo.id);
  }
}
