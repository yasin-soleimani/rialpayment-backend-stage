import { Controller, Post, Req, Body, Get } from "@vision/common";
import { CampaignCoreLoginService } from "../../../Core/campaign/services/login.service";
import { GeneralService } from "../../../Core/service/general.service";
import { Roles } from "../../../Guard/roles.decorations";
import { getMerchantInfo } from "../../../WSDL/common/getMerchantInfo";
import { SendToAllMelliPayamakApiService } from "../sendtoall/services/melli-payamak.service";

@Controller('campaign/branch')
export class CamapignBranchApiController {

  constructor(
    private readonly melliPayamakService: SendToAllMelliPayamakApiService,
    private readonly generalService: GeneralService,
  ) { }

  @Post()
  @Roles('customerclub')
  async getBranch(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.melliPayamakService.getBrachns(getInfo.code);
  }

  @Post('send')
  @Roles('customerclub')
  async send(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.melliPayamakService.bulkSend(getInfo.title, getInfo.message,
      getInfo.branch, getInfo.rangeFrom, getInfo.rangeTo, getInfo.dateToSend, getInfo.requestCount);
  }

  @Post('count')
  @Roles('customerclub')
  async getCount(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.melliPayamakService.getBulkCount(getInfo.branch, getInfo.rangeFrom, getInfo.rangeTo);
  }


}