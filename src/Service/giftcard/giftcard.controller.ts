import { Controller, Get, Post, Body, Res, Req } from '@vision/common';
import { GiftcardService } from './giftcard.service';

@Controller('giftcard')
export class GiftCardServiceController {
  constructor(private readonly giftcardService: GiftcardService) {}

  @Get('list')
  async getist(): Promise<any> {
    return this.giftcardService.getList();
  }

  @Post('submit')
  async setMObile(@Body() getInfo): Promise<any> {
    return this.giftcardService.setMobile(getInfo.mobile, getInfo.group);
  }

  @Post('verify')
  async veify(@Body() getInfo, @Req() req): Promise<any> {
    return this.giftcardService.verify(getInfo.mobile, getInfo.code, req.ip);
  }

  @Post('callback')
  async callback(@Body() getInfo, @Res() res): Promise<any> {
    return this.giftcardService.callback(getInfo, res);
  }

  @Post('details')
  async getDetails(@Body() getInfo): Promise<any> {
    return this.giftcardService.getDetails(getInfo.id);
  }
}
