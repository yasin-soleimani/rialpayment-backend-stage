import { Body, Controller, Get, Post, Put, Req } from "@vision/common";
import { CampaignDto } from "../../Core/campaign/dto/campaign.dto";
import { GeneralService } from "../../Core/service/general.service";
import { Roles } from "../../Guard/roles.decorations";
import { BackofficeCampaignService } from "./campaign.service";
import { CampaignFilterDto } from "./dto/filter.dto";

@Controller('campaign')
export class BackofficeCampaignController {

  constructor(
    private readonly generalService: GeneralService,
    private readonly campaignService: BackofficeCampaignService
  ) { }

  @Roles('admin')
  @Post('manage')
  async addNew(@Body() getInfo: CampaignDto, @Req() req: any): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    getInfo.user = userid;
    return this.campaignService.addNew(getInfo);
  }

  @Roles('admin')
  @Put('manage')
  async edit(@Body() getInfo: CampaignDto, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    getInfo.user = userId;

    return this.campaignService.edit(getInfo);
  }

  @Roles('admin')
  @Post('manage/status')
  async changeStatus(@Body() getInfo: CampaignDto, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.campaignService.changeStatus(getInfo.id, getInfo.status);
  }

  @Roles('admin')
  @Post('manage/filter')
  async getList(@Body() getInfo: CampaignFilterDto, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return this.campaignService.getList(getInfo, page)
  }
}