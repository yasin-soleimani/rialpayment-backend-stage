import { Controller, Get, Post, Req } from '@vision/common';
import { BackofficeReportService } from './report.service';
import { Body } from '@vision/common/decorators/http/route-params.decorator';
import { Roles } from '../../Guard/roles.decorations';
import { GeneralService } from '../../Core/service/general.service';
import { BackofficeReportDto } from './dto/report.dto';

@Controller('report')
export class BackofficeReportController {
  constructor(
    private readonly reportService: BackofficeReportService,
    private readonly generalService: GeneralService
  ) {}

  @Post('')
  // @Roles('admin')
  async getReport(@Body() getInfo: BackofficeReportDto, @Req() req): Promise<any> {
    return this.reportService.getReport(getInfo);
  }

  @Post('ipg')
  @Roles('admin')
  async getIpgReport(@Body() getInfo, @Req() req): Promise<any> {
    const page = await this.generalService.getPage(req);
    return this.reportService.getIpgReport(getInfo.to, getInfo.from, getInfo.terminalid, page, getInfo.cardnumber);
  }

  @Post('ipg/terminal')
  @Roles('admin')
  async getTerminalInfo(@Body() getInfo, @Req() req): Promise<any> {
    return this.reportService.getTerminalInfo(getInfo.terminalid);
  }

  @Post('ipg/transaction')
  @Roles('admin')
  async getTransactionInfo(@Body() getInfo): Promise<any> {
    return this.reportService.getTraxInfo(getInfo.terminalid, getInfo.userinvoice);
  }
}
