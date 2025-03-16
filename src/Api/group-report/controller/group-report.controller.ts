import { Body, Controller, Get, Post, Req } from '@vision/common';
import { GeneralService } from '../../../Core/service/general.service';
import { Roles } from '../../../Guard/roles.decorations';
import { GroupReportApiService } from '../services/group-report.service';

@Controller('group/report')
export class GroupReportApiController {
  constructor(private readonly reportService: GroupReportApiService, private readonly generalService: GeneralService) {}

  @Roles('customerclub', 'agent')
  @Post('merchant')
  async getRep(@Body() getInfo, @Req() req): Promise<any> {
    console.log(getInfo, 'getInfo');
    const userId = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return this.reportService.gerReport(
      getInfo.merchant,
      userId,
      getInfo.group,
      getInfo.from,
      getInfo.to,
      page,
      getInfo.type ?? 1
    );
  }

  @Post('merchant/excel')
  @Roles('customerclub', 'agent')
  async getExcel(@Body() getInfo, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.reportService.excel(
      getInfo.merchant,
      userId,
      getInfo.group,
      getInfo.from,
      getInfo.to,
      getInfo.type ?? 1
    );
  }
}
