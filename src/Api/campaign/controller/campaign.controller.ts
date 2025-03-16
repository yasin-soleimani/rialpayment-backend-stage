import { Body, Controller, Injectable, Post, Req, successOptWithPagination } from "@vision/common";
import { CampaignFilterDto } from "../../../Backoffice/campaign/dto/filter.dto";
import { CampaignDto } from "../../../Core/campaign/dto/campaign.dto";
import { GeneralService } from "../../../Core/service/general.service";
import { Roles } from "../../../Guard/roles.decorations";
import { CampaignApiService } from "../campaign.service";


@Controller('campaign')
export class CamapignApiController {

  constructor(
    private readonly campaignService: CampaignApiService,
    private readonly generalService: GeneralService
  ) { }

  @Roles('customerclub')
  @Post()
  async newCampaign(@Body() getInfo: CampaignDto, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    getInfo.user = userId;
    return this.campaignService.addNew(getInfo);
  }

  @Roles('customerclub')
  @Post('status')
  async changeStatus(@Body() getInfo: CampaignDto, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.campaignService.changeStatus(getInfo.id, getInfo.status);
  }

  @Roles('customerclub')
  @Post('filter')
  async filter(@Body() getInfo: CampaignFilterDto, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);

    return this.campaignService.getList(getInfo, page, userId);
  }

  @Roles('customerclub')
  @Post('report')
  async report(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return successOptWithPagination({
      docs: [
        {
          fullname: 'کاربر تست',
          ref: 'Campaign-564646550',
          amount: 20000,
          type: 3,
          createdAt: '2021-02-04T16:48:17.677Z'
        }, {
          fullname: '2 کاربر تست',
          ref: 'Campaign-564646580',
          amount: 20000,
          type: 3,
          createdAt: '2021-02-04T16:48:17.677Z'
        }
      ],
      total: 2,
      limit: 50,
      page: 1,
      pages: 1
    })
  }

}