import { Controller, Get, Post, Req, Body } from '@vision/common';
import { GeneralService } from '../../Core/service/general.service';
import { StoreService } from './store.service';
import { StoreTerminalSearchDto } from './dto/store.dto';
import { getHeaderSort } from '@vision/common/utils/validate-each.util';
import { StoreListService } from './services/store-search.service';

@Controller('store')
export class StoreController {
  constructor(
    private readonly storeService: StoreService,
    private readonly generalService: GeneralService,
    private readonly StoreSearchService: StoreListService
  ) {}

  @Get()
  async getProfile(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return await this.storeService.getListStores(page, userid);
  }

  @Get('comments')
  async newComment(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    const terminalid = await this.generalService.getMetchantCode(req);
    return await this.storeService.listComments(terminalid, page);
  }

  @Get('bookmark')
  async bookmark(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const merchantid = await this.generalService.getMetchantCode(req);
    return await this.storeService.bookmark(userid, merchantid);
  }

  @Post('public')
  async getPublicList(@Body() getInfo: StoreTerminalSearchDto, @Req() req): Promise<any> {
    const page = await this.generalService.getPage(req);
    const sort = await getHeaderSort(req);
    const sortQuery = this.storeService.setSort(sort);
    if (
      getInfo.all == true ||
      this.storeService.checkEmptyInputs(getInfo) ||
      this.storeService.checkFalseInputs(getInfo)
    ) {
      return await this.storeService.getPublicListStores(page, sortQuery);
    } else {
      return await this.storeService.searchPublicStores(getInfo, page, sortQuery);
    }
  }

  @Post('public/detail')
  async getpublicDetail(@Body() data, @Req() req): Promise<any> {
    const storeid = data.id;
    return await this.storeService.showPublicStore(storeid);
  }

  @Post('search')
  async tts(@Body() getInfo: StoreTerminalSearchDto, @Req() req): Promise<any> {
    const page = await this.generalService.getPage(req);
    const userid = await this.generalService.getUserid(req);
    return this.StoreSearchService.searchList(getInfo, page, '55');
  }

  @Post()
  async tls(@Body() data, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const storeid = data.id;
    return this.StoreSearchService.showStore(storeid, userid);
  }
}
