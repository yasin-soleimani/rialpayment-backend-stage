import { Controller, Post, Body, Req, Render, Query, Get, Res, Session } from '@vision/common';
import { InternetPaymentGatewayService } from './ipg.service';

@Controller('internetpaymentgateway')
export class InternetPaymentGatewayServiceController {
  constructor(private readonly ipgService: InternetPaymentGatewayService) {}

  @Post()
  async getToken(@Body() getInfo, @Req() req): Promise<any> {
    return this.ipgService.getToken(getInfo, req);
  }

  @Post('pay')
  @Render('internetpaymentgateway/index')
  async getPayment(@Body() getInfo, @Session() session): Promise<any> {
    return this.ipgService.getPayment(getInfo, session);
  }

  @Post('payment')
  async getPaymentApi(@Body() getInfo): Promise<any> {
    return this.ipgService.getPaymentApi(getInfo);
  }

  @Get('result')
  async resultPayment(@Query() query, @Res() res): Promise<any> {
    return this.ipgService.showResult(query.token, res);
  }

  @Post('cancel')
  async calncelTransaction(@Body() getInfo): Promise<any> {
    return this.ipgService.cancelTransaction(getInfo.token);
  }

  @Post('result')
  async resultPaymentPost(@Query() query, @Res() res): Promise<any> {
    return this.ipgService.showResult(query.token, res);
  }

  @Post('verify')
  async verifyPayment(@Body() getInfo, @Req() req): Promise<any> {
    return this.ipgService.verifyPayment(getInfo.token, req);
  }
}
