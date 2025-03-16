import { Controller, Get, Req } from '@vision/common';
import { Roles } from '../../Guard/roles.decorations';
import { BackofficeDashboardService } from './dashboard.service';
import { GeneralService } from '../../Core/service/general.service';
import { isEmpty } from '@vision/common/utils/shared.utils';

@Controller('dashboard')
export class BackofficeDashboardController {
  constructor(
    private readonly dahsboardService: BackofficeDashboardService,
    private readonly generalService: GeneralService
  ) {}

  @Get()
  @Roles('admin')
  async getDashboard(@Req() req): Promise<any> {
    let limit = await this.generalService.getType(req);
    if (isEmpty(limit)) limit = 7;
    return this.dahsboardService.getIpgLast15(Number(limit));
  }
}
