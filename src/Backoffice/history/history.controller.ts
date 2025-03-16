import { Controller, Get, Post, Req } from '@vision/common';
import { GeneralService } from '../../Core/service/general.service';
import { BackofficeHistoryService } from './history.service';
import { Body } from '@vision/common/decorators/http/route-params.decorator';
import { BackofficeHistoryDto } from './dto/history.dto';
import { Roles } from '../../Guard/roles.decorations';

@Controller('history')
export class BackofficeHistoryController {
  constructor(
    private readonly generalService: GeneralService,
    private readonly historyService: BackofficeHistoryService
  ) {}

  @Get()
  @Roles('admin')
  async getList(@Req() req): Promise<any> {
    const page = await this.generalService.getPage(req);
    const userid = await this.generalService.getID(req);
    return this.historyService.getList(userid, page);
  }

  @Post()
  @Roles('admin')
  async filterList(@Body() getInfo: BackofficeHistoryDto, @Req() req): Promise<any> {
    const page = await this.generalService.getPage(req);
    const userid = await this.generalService.getID(req);
    return this.historyService.getFilterList(getInfo, userid, page);
  }
}
