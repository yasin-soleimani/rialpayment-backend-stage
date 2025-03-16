import { Controller, Get, Post, Put, Body, Req } from '@vision/common';
import { GroupCoreService } from '../../Core/group/group.service';
import { GeneralService } from '../../Core/service/general.service';
import { BackofficeGiftcardDto } from './dto/giftcard.dto';
import { BackofficeGiftcardService } from './giftcard.service';

@Controller('giftcard')
export class BackofficeGiftCardController {
  constructor(
    private readonly giftcardService: BackofficeGiftcardService,
    private readonly generalService: GeneralService
  ) {}

  @Get('groups/list')
  async getGroupList(): Promise<any> {
    return this.giftcardService.getGroups();
  }

  @Post('groups/settings')
  async setSettings(@Body() getInfo: BackofficeGiftcardDto): Promise<any> {
    delete getInfo.id;
    return this.giftcardService.addNew(getInfo);
  }

  @Put('groups/settings')
  async editSettings(@Body() getInfo: BackofficeGiftcardDto): Promise<any> {
    return this.giftcardService.edit(getInfo);
  }

  @Post('groups/settings/status')
  async changeStatus(@Body() getInfo): Promise<any> {
    return this.giftcardService.changeStatus(getInfo.id, getInfo.status);
  }

  @Post('filter')
  async getFilter(@Body() getInfo, @Req() req): Promise<any> {
    const page = await this.generalService.getPage(req);
    return this.giftcardService.filter(getInfo, page);
  }
}
