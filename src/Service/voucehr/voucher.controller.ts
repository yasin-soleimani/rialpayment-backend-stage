import { Controller, Post, Req } from '@vision/common';
import { Body } from '@vision/common/decorators/http/route-params.decorator';
import { VoucherServiceDto } from './dto/voucher.dto';
import { SafeVoucherWebService } from './voucher.service';

@Controller('voucher')
export class SafeVoucehrServiceController {
  constructor(private readonly voucherService: SafeVoucherWebService) {}

  @Post()
  async userVoucehr(@Body() getInfo: VoucherServiceDto, @Req() req): Promise<any> {
    return this.voucherService.use(getInfo);
  }

  @Post('getToken')
  async getToken(@Body() getInfo): Promise<any> {
    return this.voucherService.getToken(getInfo);
  }

  @Post('token')
  async tokenInfo(@Body() getInfo): Promise<any> {
    return this.voucherService.getTokenInfo(getInfo.token);
  }

  @Post('payment')
  async getPayment(@Body() getInfo): Promise<any> {
    return this.voucherService.getPayment(getInfo);
  }

  @Post('tarxInfo')
  async TraxInfo(@Body() getInfo): Promise<any> {
    return this.voucherService.getTraxInfo(getInfo.token);
  }

  @Post('cancel')
  async cancel(@Body() getInfo): Promise<any> {
    return this.voucherService.cancelPayment(getInfo.token);
  }
}
