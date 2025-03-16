import { Controller, Body, Req, Post, Get, Query } from '@vision/common';
import { ReportApiDto } from './dto/report.dto';
import { ReportApiService } from './report.service';
import { GeneralService } from '../../Core/service/general.service';
import { ReportAllDto } from './dto/report-all.dto';
import { ReportUserBlockDto } from './dto/report-user-block.dto';
import { Roles } from '../../Guard/roles.decorations';
import { CronJob } from 'cron';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportApiService, private readonly generalService: GeneralService) {
    const job = new CronJob(
      '0 35 5 * * *', // cronTime
      async () => {
        await this.prsettle();
      }, // onTick
      null, // onComplete
      true, // start
      'Asia/Tehran' // timeZone
    );
    const job2 = new CronJob(
      '0 0 8 * * *', // cronTime
      async () => {
        await this.settleCashout();
      }, // onTick
      null, // onComplete
      true, // start
      'Asia/Tehran' // timeZone
    );
  }

  async prsettle() {
    return this.reportService.generateSettlementsOfLastDay();
  }
  @Get('merchant-settle')
  async settle(@Query('day') day: string) {
    return this.reportService.generateSettlementsOfLastDay(!!day ? parseInt(day) : 1);
  }

  @Get('merchant-settle/cashout')
  async settleCashout() {
    return this.reportService.calculateAutoCashout();
  }

  @Post()
  // @Roles('agent')
  async filterReport(@Body() getInfo: ReportApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    const id = await this.generalService.getID(req);
    getInfo.type = Number(getInfo.type) ?? 1;
    return this.reportService.getFilter(getInfo, userid, page, id);
  }

  @Post('confirm')
  // @Roles('agent')
  async confirmIpg(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.reportService.confirmIpg(getInfo.ref, userid);
  }

  @Post('all')
  @Roles('agent')
  async getAllReport(@Body() getInfo: ReportAllDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return this.reportService.reportAll(getInfo, page);
  }

  @Post('user')
  @Roles('agent')
  async chnageUserStatys(@Body() getInfo: ReportUserBlockDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.reportService.changeStatus(getInfo);
  }

  @Get('merchants')
  async MetchantLists(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.reportService.getMerchantsList(userid);
  }

  @Get('merchants/shares')
  async getMerchantShares(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const id = await this.generalService.getID(req);
    return this.reportService.getMerchantShares(id, userid);
  }

  @Get('terminals')
  async terminalsList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const id = await this.generalService.getID(req);
    return this.reportService.getTerminalsList(id);
  }

  @Get('ipg')
  async getIpgLists(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.reportService.mipglist(userid);
  }

  @Post('excels')
  async getReportExcel(@Body() getInfo: ReportApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    getInfo.type = Number(getInfo.type) ?? 1;
    const id = await this.generalService.getID(req);
    return this.reportService.getReportExcel(getInfo, userid, id);
  }

  @Post('excel')
  async getReportExcels(@Body() getInfo: ReportApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    getInfo.type = Number(getInfo.type) ?? 1;
    const id = await this.generalService.getID(req);
    return this.reportService.getNewReportExcel(getInfo, userid, id);
  }
}
