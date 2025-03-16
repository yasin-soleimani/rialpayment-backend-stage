import { Controller, Post, Body, Get, Req, Put, Delete } from '@vision/common';
import { CreateMipgDto } from './dto/create-mipg.dto';
import { MipgCoreService } from '../../Core/mipg/mipg.service';
import { GeneralService } from '../../Core/service/general.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { MipgBackOfficeService } from './mipg.service';
import { MipgSearchDto } from './dto/search-mipg.dto';
import { getHeaderCategory } from '@vision/common/utils/validate-each.util';
import { categoryManage } from '@vision/common/category/merchant-category';
import { MipgDirectApiDto } from './dto/direct-mipg.dto';

@Controller('mipg')
export class MipgController {
  constructor(
    private readonly mipgService: MipgCoreService,
    private readonly generalService: GeneralService,
    private readonly mipgBOService: MipgBackOfficeService
  ) {}

  @Post()
  async create(@Body() createMipg: CreateMipgDto, @Req() req): Promise<any> {
    createMipg.ref = await this.generalService.getUserid(req);
    return this.mipgService.create(req, createMipg);
  }

  @Get()
  async getList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    let page = await this.generalService.getPage(req);
    if (isEmpty(page)) page = 1;
    let category = await getHeaderCategory(req);
    if (!isEmpty(category) && category != 'all') {
      const catx = new categoryManage();
      category = await catx.findCat(category);
      console.log(category, 'cty');
      if (!category) {
        category = 'all';
      } else {
        category = category.name;
      }
    } else {
      category = 'all';
    }
    const data = await this.mipgService.getAll(userid, page, category);
    return this.mipgBOService.listTransform(data);
  }

  @Post('search')
  // todo fix this scope in service
  async search(@Body() getInfo: MipgSearchDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    let page = await this.generalService.getPage(req);
    if (isEmpty(page)) page = 1;
    let category = await getHeaderCategory(req);
    if (!isEmpty(category) && category != 'all') {
      category = await this.mipgService.searchCategoryName(category);
      if (!category) {
        category = 'all';
      } else {
        category = category.name;
      }
    } else {
      category = 'all';
    }
    const data = await this.mipgService.search(userid, page, category, getInfo.search);
    return this.mipgBOService.listTransform(data);
  }

  @Post('sharing')
  async submitNewSharing(@Body() getInfo, @Req() req): Promise<any> {
    console.log(getInfo, 'info');
    const userid = await this.generalService.getUserid(req);
    return this.mipgBOService.addSharing(getInfo, userid);
  }

  @Get('sharing')
  async getSharingList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const id = await this.generalService.getID(req);
    return this.mipgBOService.getSharingList(id, userid);
  }

  @Delete('sharing')
  async deleteSharing(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const id = await this.generalService.getID(req);
  }

  @Put()
  async updateInfo(@Body() createMipg: CreateMipgDto, @Req() req): Promise<any> {
    createMipg.ref = await this.generalService.getUserid(req);
    return this.mipgService.updateInfo(req, createMipg);
  }

  @Post('cat')
  async getCat(@Req() req): Promise<any> {
    const category = await getHeaderCategory(req);
    return await this.mipgService.searchCategoryName(category);
  }

  @Get('status')
  async changeStatus(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const id = await this.generalService.getID(req);
    return this.mipgService.changeTerminalStatus(id, userid);
  }

  @Post('report')
  async IpgReport(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return this.mipgBOService.getReport(getInfo, userid, page);
  }

  @Post('pardakhtyari')
  async addNew(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.mipgBOService.addnewPardakhtyari(getInfo, userid);
  }

  @Put('pardakhtyari')
  async edit(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.mipgBOService.editPardakhtyari(getInfo);
  }

  @Get('pardakhtyari')
  async getlist(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const mipgid = await this.generalService.getID(req);
    console.log(mipgid, 'mipg id');
    return this.mipgBOService.getPardakhtyariList(mipgid);
  }

  @Delete('pardakhtyari')
  async remove(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const id = await this.generalService.getID(req);
    return this.mipgBOService.removePardakhtyari(id);
  }

  @Post('pardakhtyari/changepassword')
  async changePasswordPardakhtyari(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.mipgBOService.changePasswordPardakhtyar(getInfo.id, getInfo.oladpassword, getInfo.newpassword);
  }

  @Get('pardakhtyari/default')
  async makeDefault(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const id = await this.generalService.getID(req);

    return this.mipgBOService.makeDefault(id);
  }

  @Get('direct')
  async getDirectLists(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const id = await this.generalService.getID(req);
    return this.mipgBOService.getDirectList(id);
  }

  @Post('direct')
  async addNewDirect(@Body() getInfo: MipgDirectApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.mipgBOService.addNewDirect(getInfo);
  }

  @Put('direct')
  async updateDirect(@Body() getInfo: MipgDirectApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.mipgBOService.editDirect(getInfo);
  }

  @Post('direct/status')
  async changeDirectStatus(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.mipgBOService.changeStatusDirect(getInfo.id, getInfo.status);
  }

  @Post('voucher')
  async submitVoucher(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.mipgBOService.submitVoucehr(getInfo);
  }

  @Get('voucher')
  async getVoucher(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const id = await this.generalService.getID(req);
    return this.mipgBOService.getVoucher(id);
  }

  @Post('isdirect')
  async changeIsDirect(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.mipgBOService.changeIsDirect(getInfo.id, getInfo.isdirect);
  }

  @Post('wagetype')
  async changeWageType(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.mipgBOService.changeWageType(getInfo.id, getInfo.wagetype);
  }

  @Post('auth')
  async submitAuth(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.mipgBOService.submitAuth(getInfo);
  }

  @Get('auth')
  async getAuth(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const id = await this.generalService.getID(req);
    return this.mipgBOService.getAuthList(id, userid);
  }
}
