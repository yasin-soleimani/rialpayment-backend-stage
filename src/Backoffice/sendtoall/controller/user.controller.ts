import { Body, Controller, Get, Post, Req } from "@vision/common";
import { GeneralService } from "../../../Core/service/general.service";
import { SendToAllBackofficeDto } from "../dto/send.dto";
import { SendToAllUnauthorizedUsersDto, SendToAllUsersFilterDto } from "../dto/users.dto";
import { BackofficeSendToAllFilterService } from "../services/filter.service";
import { BackofficeSendToAllSendMessageService } from "../services/send.service";
import { BackofficeSendToAllUserService } from "../services/user.service";

@Controller('sendtoall/users')
export class BackofficeSendToAllUserController {

  constructor(
    private readonly generalService: GeneralService,
    private readonly filterService: BackofficeSendToAllFilterService,
    private readonly sendService: BackofficeSendToAllSendMessageService
  ) { }

  @Post('filter')
  async getFilter(@Body() getInfo: SendToAllBackofficeDto, @Req() req): Promise<any> {
    const page = await this.generalService.getPage(req);
    return this.filterService.getFilter(getInfo, page);
  }

  @Get('group')
  async getGroup(@Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const id = await this.generalService.getID(req);
    return this.filterService.getGroup(id);
  }

  @Post('send')
  async sendMessage(@Body() getInfo: SendToAllBackofficeDto, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.sendService.action(userId, getInfo);
  }
}