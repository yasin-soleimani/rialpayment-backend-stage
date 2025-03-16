import { Controller, Get, Req } from '@vision/common';
import { GeneralService } from '../../Core/service/general.service';
import { AppVersionApiService } from './appVersionApi.service';

@Controller('application')
export class AppVersionApiController {
  constructor(
    private readonly generalService: GeneralService,
    private readonly usercardService: AppVersionApiService
  ) {}

  @Get('version')
  async getVersion(@Req() req): Promise<any> {
    return this.usercardService.getLastVersion();
  }
}
