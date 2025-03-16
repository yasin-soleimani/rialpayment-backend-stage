import { Controller, Post, Req } from '@vision/common';
import { GeneralService } from '../../Core/service/general.service';
import { Body } from '@vision/common/decorators/http/route-params.decorator';
import { MplReqApiDto } from './dto/mpl-req.dto';
import { MplVerifyApiDto } from './dto/mpl-verify.dto';
import { MplApiService } from './mpl.service';

@Controller('mpl')
export class MplApiController {
  constructor(private readonly generalService: GeneralService, private readonly mplService: MplApiService) {}

  @Post()
  async getToken(@Body() getInfo: MplReqApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.mplService.getToken(getInfo, userid);
  }

  @Post('verify')
  async verify(@Body() getInfo: MplVerifyApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.mplService.verify(getInfo, userid);
  }

  @Post('total')
  async total(@Body() getInfo): Promise<any> {
    return this.mplService.chareg(getInfo.user);
  }
}
