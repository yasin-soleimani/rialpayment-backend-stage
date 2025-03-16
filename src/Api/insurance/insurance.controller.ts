import { Controller, Get, Req, Post, Body, Query, Res } from '@vision/common';
import { InsuranceApiService } from './insurance.service';
import { GeneralService } from '../../Core/service/general.service';
import { InsuranceHistoryApiDto } from './dto/history.dto';
import { InsuranceHistoryApiService } from './services/history.service';
import { InsuranceRedirectApiService } from './services/redirect.service';

@Controller('insurance')
export class InsuranceApiController {
  constructor(
    private readonly insuranceService: InsuranceApiService,
    private readonly historyService: InsuranceHistoryApiService,
    private readonly generalService: GeneralService,
    private readonly redirectService: InsuranceRedirectApiService
  ) {}

  @Get()
  async getProductList(@Req() req): Promise<any> {
    const id = await this.generalService.getID(req);
    return this.insuranceService.getList(id);
  }

  @Post('submit')
  async submit(@Body() getInfo: InsuranceHistoryApiDto): Promise<any> {
    return this.historyService.addNew(getInfo);
  }

  @Get('redirect')
  async redirect(@Query() query, @Res() res): Promise<any> {
    this.redirectService.getRedirect(query.token, res);
  }

  @Post('payment/status')
  async PaymentStatus(@Body() getInfo, @Res() res): Promise<any> {
    return this.insuranceService.paymentStatus(getInfo.token, res);
  }

  @Post('payment/info')
  async getProductInfo(@Body() getInfo): Promise<any> {
    console.log(getInfo, 'getInfo');
    return this.historyService.getTransactionInfo(getInfo.id, getInfo.ref);
  }
}
