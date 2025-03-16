import { Body, Controller, Post, Req } from "@vision/common";
import { GeneralService } from "../../../Core/service/general.service";
import { Roles } from "../../../Guard/roles.decorations";
import { BackofficeSendToAllUserService } from "../services/user.service";

@Controller('sendtoall/report')
export class BackofficeSendToAllReportController {

  constructor(
    private readonly sendToAllService: BackofficeSendToAllUserService,
    private readonly generalService: GeneralService
  ) { }

  @Post('list')
  @Roles('admin')
  async getList(@Body() getInfo, @Req() req): Promise<any> {
    const userId: string = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    let gid = await this.generalService.getGID(req);
    if (gid == 'null') gid = null;

    return this.sendToAllService.getList(getInfo, page, gid);
  }
}