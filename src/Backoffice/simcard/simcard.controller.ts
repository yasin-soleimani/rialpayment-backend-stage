import { Controller, Post, Body, Req } from '@vision/common';
import { SimcardBackofficeService } from './simcard.service';
import { Roles } from '../../Guard/roles.decorations';
import { GeneralService } from '../../Core/service/general.service';

@Controller('simcard')
export class SimcardBackofficeController {
  constructor(
    private readonly generalService: GeneralService,
    private readonly simcardService: SimcardBackofficeService
  ) {}

  @Post('report')
  @Roles('admin')
  async getReport(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.simcardService.getReport(getInfo);
  }
}
