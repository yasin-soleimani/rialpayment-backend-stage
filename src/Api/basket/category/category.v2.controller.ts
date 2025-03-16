import { Controller, Post, Body, Req, Get, Put, Delete } from '@vision/common';
import { BasketCategoryApiDto } from './dto/basket.dto';
import { GeneralService } from '../../../Core/service/general.service';
import { BasketCategoryApiService } from './category.service';

@Controller('basket/category-v2')
export class BasketCategoryControllerV2 {
  constructor(
    private readonly generalService: GeneralService,
    private readonly categoryService: BasketCategoryApiService
  ) {}

  /*  @Get('/convert-id')
  async convertUriToId(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.categoryService.changeSlugToId(req.headers.uri, userid);
  }*/

  @Post()
  async addNew(@Body() getInfo: BasketCategoryApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    getInfo.user = userid;
    return this.categoryService.addNewV2(getInfo);
  }

  @Post('checkslug')
  async checkSlug(@Body() getInfo: Pick<BasketCategoryApiDto, 'slug' | 'user'>, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    getInfo.user = userid;
    return this.categoryService.checkSlugV2(getInfo);
  }

  @Get()
  async getList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const parent = await this.generalService.getCategoryParent(req);
    return this.categoryService.getListV2(userid, parent);
  }

  @Put()
  async udpate(@Body() getInfo: BasketCategoryApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.categoryService.editV2(getInfo, userid);
  }

  @Delete()
  async remove(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const id = await this.generalService.getID(req);
    return this.categoryService.removeV2(id, userid);
  }
}
