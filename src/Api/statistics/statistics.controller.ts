import { Controller, Body, Post, Get, Req, Res } from '@vision/common';
import { StatisticsApiService } from './statistics.service';
import { GeneralService } from '../../Core/service/general.service';

@Controller('statistics')
export class StatisticsApiController {
  constructor(
    private readonly statisticsService: StatisticsApiService,
    private readonly generalService: GeneralService
  ) {}

  @Post('card')
  async getCalc(@Body() getInfo): Promise<any> {
    return this.statisticsService.getCalc(getInfo.gid, getInfo.from, getInfo.to);
  }

  @Post('card/pdf')
  async getCardPdf(@Body() getInfo, @Res() res): Promise<any> {
    return this.statisticsService.makeCardPdf(getInfo.gid, getInfo.from, getInfo.to, res);
  }

  @Get('group')
  async getGroupList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.statisticsService.getGroupList(userid);
  }

  @Get('update')
  async getUpdate(): Promise<any> {
    return this.statisticsService.testUSers();
  }
}
