import { Controller, Post, Body, Req } from '@vision/common';
import { GeneralService } from '../../Core/service/general.service';
import { MplService } from './mpl.service';

@Controller('mpl')
export class MplController {
  constructor(private readonly generalService: GeneralService, private readonly mplService: MplService) {}

  @Post()
  async getToken(@Body() getInfo, @Req() req): Promise<any> {
    return this.mplService.newReq(getInfo);
  }

  @Post('verify')
  async verifyTrans(@Body() getInfo, @Req() req): Promise<any> {
    return this.mplService.verify(getInfo);
  }
}
