import { Body, Controller, Get, Post, Put, Req } from '@vision/common';
import { CampaignDto } from '../../Core/campaign/dto/campaign.dto';
import { GeneralService } from '../../Core/service/general.service';
import { Roles } from '../../Guard/roles.decorations';
import { BackofficeAppVersionService } from './appVersion.service';

@Controller('application')
export class BackofficeAppVersionController {
  constructor(
    private readonly generalService: GeneralService,
    private readonly campaignService: BackofficeAppVersionService
  ) {}

  @Roles('admin')
  @Post('add')
  async addNew(
    @Body() getInfo: { force: '1' | '0' | boolean; version: string | number; versionString: string },
    @Req() req: any
  ): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.campaignService.addNew(req, getInfo);
  }
}
