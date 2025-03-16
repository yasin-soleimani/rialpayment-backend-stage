import { Controller, Post, Req, Body, Get } from '@vision/common';
import { GeneralService } from '../../Core/service/general.service';
import { IdentifyApiService } from './identify.service';
import { getMerchantInfo } from 'src/WSDL/common/getMerchantInfo';
import { Request } from 'express';

@Controller('identify')
export class IdentifyApiController {
  constructor(private readonly generalService: GeneralService, private readonly identifyService: IdentifyApiService) {}

  @Post('upload')
  async upload(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const nationalcode = await this.generalService.getNationalcode(req);
    if (nationalcode) {
      getInfo.nationalcode = nationalcode;
    }

    const cardno = await this.generalService.getCardno(req);
    if (cardno) {
      getInfo.cardno = cardno;
    }
    return this.identifyService.uploadData(getInfo, req, userid);
  }

  @Get('')
  async getLastByUserId(@Req() req: Request): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.identifyService.getLastByUserId(userid);
  }
}
