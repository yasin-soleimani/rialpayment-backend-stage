import { Controller, Post, Body, Res } from '@vision/common';
import { ServiceChargeService } from './charge.service';
import { ChargeIpgServiceDto } from './dto/charge-ipg.dto';
import { ChargeIpgService } from './services/ipg.service';

@Controller('charge')
export class ChargeServiceController {
  constructor(
    private readonly chargeService: ServiceChargeService,
    private readonly ipgChargeService: ChargeIpgService
  ) {}

  @Post('card/info')
  async getCardInfo(@Body() getInfo): Promise<any> {
    return this.chargeService.getCardInfo(getInfo.cardno);
  }

  @Post('token')
  async getToken(@Body() getInfo: ChargeIpgServiceDto): Promise<any> {
    return this.ipgChargeService.getTokenIpg(getInfo);
  }

  @Post('callback')
  async callback(@Body() getInfo, @Res() res): Promise<any> {
    return this.ipgChargeService.callback(getInfo, res);
  }
}
