import { Body, Controller, Post, Req } from "@vision/common";
import { GeneralService } from "../../Core/service/general.service";
import { SendtoAllApiService } from "./sendtoall.service";

@Controller('sendtoall')
export class SendToAllApiController {

  constructor(
    private readonly sendService: SendtoAllApiService,
    private readonly generalService: GeneralService
  ) { }

  @Post('users')
  async getUsers(@Body() getInfo, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.sendService.getFilter(getInfo, userId)
  }

}