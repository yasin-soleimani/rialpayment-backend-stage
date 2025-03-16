import { Body, Controller, Get, Post, Req } from '@vision/common';
import { MerchantPspCustomerDto } from '../../Core/merchant-psp/dto/customer.dto';
import { MerchantPspRequestDto } from '../../Core/merchant-psp/dto/request.dto';
import { GeneralService } from '../../Core/service/general.service';
import { Roles } from '../../Guard/roles.decorations';
import { BackofficeMerchantPspService } from './merchant-psp.service';

@Controller('merchant-psp')
export class BackofficeMerchantPspController {
  constructor(
    private readonly generalService: GeneralService,
    private readonly pspService: BackofficeMerchantPspService
  ) {}

  @Roles('admin')
  @Post('register/customer')
  async submitNewCustomer(@Body() getInfo: MerchantPspCustomerDto, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    console.log(getInfo);
    getInfo.user = userId;
    return this.pspService.subCustomer(getInfo);
  }

  @Roles('admin')
  @Post('register/request')
  async submitNewPos(@Body() getInfo: MerchantPspRequestDto, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.pspService.submitPos(getInfo);
  }

  @Roles('admin')
  @Post('document/list')
  async docList(@Body() getInfo, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.pspService.listFiles(getInfo.user, 0);
  }

  @Roles('admin')
  @Post('customer/list')
  async customerList(@Body() getInfo, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    const limit = await this.generalService.getPageLimit(req);
    return this.pspService.listCustomer(getInfo.user, page, limit);
  }

  @Roles('admin')
  @Post('request/list')
  async posList(@Body() getInfo, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    const limit = await this.generalService.getPageLimit(req);
    return this.pspService.listPos(getInfo.user, page, limit === 0 ? 20 : limit);
  }

  @Roles('admin')
  @Post('file/upload')
  async uploadFile(@Body() getInfo, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const documentType =
      !!getInfo.documentType && !isNaN(parseInt(getInfo.documentType)) ? parseInt(getInfo.documentType) : 1;
    const merchantId = getInfo.customerId;
    return this.pspService.uploadDocument(getInfo.user, merchantId, parseInt(getInfo.type), req, documentType);
  }

  @Roles('admin')
  @Get('country/list')
  async getCountryList(@Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const page = await this.generalService.getPageFromZero(req);
    const limit = await this.generalService.getPageLimit(req);
    return this.pspService.listCountries({ page, limit });
  }

  @Roles('admin')
  @Get('city/list')
  async getCityList(@Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const page = await this.generalService.getPageFromZero(req);
    const limit = await this.generalService.getPageLimit(req);
    return this.pspService.listCities({ page, limit });
  }

  @Roles('admin')
  @Get('guilds/list')
  async getGuildList(@Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const page = await this.generalService.getPageFromZero(req);
    const limit = await this.generalService.getPageLimit(req);
    return this.pspService.getGuildList({ page, limit });
  }

  @Roles('admin')
  @Get('pos/list')
  async getPosTypes(@Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const page = await this.generalService.getPageFromZero(req);
    const limit = await this.generalService.getPageLimit(req);
    return this.pspService.getPosTypes({ page, limit });
  }

  @Roles('admin')
  @Get('pos-model/list')
  async getPosModelList(@Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const page = await this.generalService.getPageFromZero(req);
    const limit = await this.generalService.getPageLimit(req);
    return this.pspService.getPosModelList({ page, limit });
  }

  @Roles('admin')
  @Get('bank/list')
  async getBankList(@Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const page = await this.generalService.getPageFromZero(req);
    const limit = await this.generalService.getPageLimit(req);
    return this.pspService.listBanks({ page, limit });
  }

  @Roles('admin')
  @Get('branches/list')
  async getBranchesList(@Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const page = await this.generalService.getPageFromZero(req);
    const limit = await this.generalService.getPageLimit(req);
    const bankId = await this.generalService.getBankId(req);
    return this.pspService.listBranches({ page, limit, bankId });
  }
}
