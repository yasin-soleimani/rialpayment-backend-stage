import { Controller, Post, Body, Req, Get } from '@vision/common';
import { DeveloperApiDto } from './dto/developer.dto';
import { GeneralService } from '../../Core/service/general.service';
import { DeveloperApiService } from './developer.service';

@Controller('developer')
export class DeveloperApiController {
  constructor(
    private readonly generalService: GeneralService,
    private readonly developerService: DeveloperApiService
  ) {}

  @Get()
  async getCallbackInfo(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.developerService.getCallbackInfo(userid);
  }
  @Post('callback')
  async addCallback(@Body() getInfo: DeveloperApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    getInfo.userid = userid;
    return this.developerService.addCallback(getInfo);
  }
}
