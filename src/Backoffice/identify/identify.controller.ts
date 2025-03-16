import { Controller, Get, Req } from '@vision/common';
import { BackofficeIdentifyService } from './identify.service';
import { GeneralService } from '../../Core/service/general.service';
import { Roles } from '../../Guard/roles.decorations';

@Controller('identify')
export class BackofficeIdentifyController {
  constructor(
    private readonly identifyService: BackofficeIdentifyService,
    private readonly generalService: GeneralService
  ) {}

  @Get()
  @Roles('admin')
  async getList(@Req() req): Promise<any> {
    const page = await this.generalService.getPage(req);
    return this.identifyService.getList(page);
  }
}
