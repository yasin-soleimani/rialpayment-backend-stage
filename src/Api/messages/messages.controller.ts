import { Controller, Get, Req, Post, Body, Session } from '@vision/common';
import { MessagesApiService } from './messages.service';
import { GeneralService } from '../../Core/service/general.service';
import { MessagesDto } from './dto/messages.dto';

@Controller('messages')
export class MessagesApiController {
  constructor(private readonly messageService: MessagesApiService, private readonly generalService: GeneralService) {}

  @Post()
  async submitNewMessage(@Body() getInfo: MessagesDto, @Req() req, @Session() session): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.messageService.newMessage(getInfo, userid, session);
  }

  @Get('list')
  async messagesList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    const type = await this.generalService.getType(req);
    return this.messageService.getList(userid, page, type);
  }

  @Get('view')
  async viewMessage(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const id = await this.generalService.getID(req);
    return this.messageService.viewMessage(id, userid);
  }
}
