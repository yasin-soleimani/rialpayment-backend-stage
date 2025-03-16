import { Body, Controller, Post, Req } from "@vision/common";
import { GeneralService } from "../../../Core/service/general.service";
import { Roles } from "../../../Guard/roles.decorations";
import { SendToAllManualApiService } from "../sendtoall/services/manual.service";

@Controller('campaign/bulk')
export class CamapignBulkApiController {

  constructor(
    private readonly manualService: SendToAllManualApiService,
    private readonly generalService: GeneralService
  ) { }

  @Post('excel')
  @Roles('customerclub')
  async excel(@Body() getInfo, @Req() req): Promise<any> {

    const userid = await this.generalService.getUserid(req);
    return this.manualService.excel(req, getInfo.message, getInfo.title, userid);
  }

  @Post('send')
  @Roles('customerclub')
  async sendMulti(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.manualService.sendAll(getInfo.mobiles, getInfo.message, 'ارسال پیامک', userid);
  }
}