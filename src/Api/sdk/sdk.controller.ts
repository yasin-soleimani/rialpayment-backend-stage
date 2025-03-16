import { Controller, Get, Post, Req, Body } from '@vision/common';
import { GeneralService } from '../../Core/service/general.service';
import { SdkService } from './sdk.service';
import { SdkRegisterDto } from './dto/mobile-register.dto';
import { MobileRequestDto } from './dto/mobile-request.dto';
import * as discount from '@vision/common/utils/discount';
import { MplSdkService } from './services/mpl.service';

@Controller('sdk')
export class SdkController {
  constructor(
    private readonly sdkService: SdkService,
    private readonly mplService: MplSdkService,
    private readonly generalService: GeneralService
  ) {}

  @Post()
  async showSTore(@Body() getInfo: SdkRegisterDto): Promise<any> {
    // return await this.sdkService.selectOpt(getInfo);
  }

  @Post('verify')
  async verify(@Body() getInfo: MobileRequestDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    // return await this.sdkService.verify(getInfo, userid);
  }

  @Get()
  async getCalc(): Promise<any> {
    return discount.discountCalc(5000, 10, 15);
  }

  @Post('icc')
  async getCharge(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.mplService.getCharge(getInfo, userid);
  }
}
