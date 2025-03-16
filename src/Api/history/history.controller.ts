import { Controller, faildOpt, Get, Post, Req, successOpt, successOptWithData, UseGuards, Body } from '@vision/common';
import { HistoryService } from './history.service';
import { GeneralService } from '../../Core/service/general.service';
import { LoggercoreService } from '../../Core/logger/loggercore.service';
import { NotFoundException } from '@vision/common/exceptions/not-found.exception';
import { getHeaderType } from '@vision/common/utils/validate-each.util';
import { RahyabCommonCoreService } from '../../Core/sms/rahyab/services/common.service';
import { HistoryCoreService } from '../../Core/history/services/history.service';
import { HistoryFilterDto } from './dto/filter.dto';
import { HistoryExcelService } from './services/excel.service';
import { LoggerCoreQueryBuilderService } from '../../Core/logger/services/filter-query.service';
import { LogegerCoreTodayService } from '../../Core/logger/services/today-log.service';
import { HistoryApiOrganizationService } from './services/organization.service';

@Controller('history')
export class HistoryController {
  constructor(
    private readonly historyService: HistoryService,
    private readonly loggerService: LoggercoreService,
    private readonly generalService: GeneralService,
    private readonly excelService: HistoryExcelService,
    private readonly filterService: LoggerCoreQueryBuilderService,
    private readonly todayService: LogegerCoreTodayService,
    private readonly orgService: HistoryApiOrganizationService
  ) { }

  @Get()
  async getList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    const type = await getHeaderType(req);
    const list = await this.loggerService.getList(userid, page, type);
    if (!list) throw new NotFoundException();
    return this.historyService.transform(list);
  }

  @Get('dashboard')
  async getDashboardList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const list = await this.loggerService.getLastTen(userid);
    return successOptWithData(list);
  }

  @Post()
  async searchList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    const type = await getHeaderType(req);
    const words = req.body.search;
    const search = await this.loggerService.search(userid, page, words, type);
    if (!search) throw new NotFoundException();
    return this.historyService.transform(search);
  }

  @Post('filter')
  async filterHistor(@Body() getInfo: HistoryFilterDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    // const type = await getHeaderType( req );

    return this.filterService.makeFilter(getInfo, userid, page);
  }

  @Post('excel')
  async getExcel(@Body() getInfo: HistoryFilterDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.excelService.makeExcel(getInfo, userid);
  }

  @Get('organization')
  async orgHistorygetList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return this.orgService.getHistory(userid, page);
  }

  @Get('tts')
  async getTts(@Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);

    return this.orgService.getTts(userId);
  }
}
