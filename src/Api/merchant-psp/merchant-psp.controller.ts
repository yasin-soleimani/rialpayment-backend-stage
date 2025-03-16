import { Body, Controller, Get, Post, Req } from '@vision/common';
import { MerchantPspRequestDto } from '../../Core/merchant-psp/dto/request.dto';
import { GeneralService } from '../../Core/service/general.service';
import { MerchantPspApiService } from './merchant-psp.service';
import { Roles } from '../../Guard/roles.decorations';
import { MerchantPspCustomerDto } from '../../Core/merchant-psp/dto/customer.dto';
import { GetRequestDetailByFollowupCodeDto } from '../../Core/merchant-psp/dto/getRequestDetailByFollowupCode.dto';
import * as mongoose from 'mongoose';

@Controller('merchant-psp')
export class MerchantPspApiController {
  constructor(private readonly generalService: GeneralService, private readonly pspService: MerchantPspApiService) {}

  /*  @Get('document/list')
  async list(@Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.pspService.getDocList(userId);
  }

  @Get('pos/list')
  async poslist(@Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.pspService.getReqList(userId);
  }

  @Get('customer/list')
  async customerlist(@Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.pspService.getCustomer(userId);
  }

  @Post('post/register')
  async getPostRegister(@Body() getInfo: MerchantPspRequestDto, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.pspService.submitRequest(getInfo);
  }*/

  @Post('register/customer')
  async submitNewCustomer(@Body() getInfo: MerchantPspCustomerDto, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    //const userUploadedFiles = await this.pspService.listFiles(userId, 1);
    getInfo.user = userId;
    //getInfo.CustomerDocumentList = [...userUploadedFiles.data];
    getInfo.CustomerDocumentList = [];
    return this.pspService.subCustomer(getInfo);
  }
  @Post('update/customer')
  async updateCustomer(@Body() getInfo: MerchantPspCustomerDto, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    console.log(getInfo);
    getInfo.user = userId;
    return this.pspService.updateCustomer(getInfo);
  }

  @Get('customer')
  async getCustomer(@Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const getInfo = {
      user: userId,
    };
    return this.pspService.getCustomerData(getInfo);
  }

  @Post('register/request')
  async submitNewPos(@Body() getInfo: MerchantPspRequestDto, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    getInfo.user = userId;
    //const userUploadedFiles = await this.pspService.listFiles(userId, 0);
    //getInfo.RequestMerchantDocument = [...userUploadedFiles.data];
    getInfo.RequestMerchantDocument = [];
    return this.pspService.submitPos(getInfo);
  }
  @Post('update/request')
  async updatePos(@Body() getInfo: MerchantPspRequestDto, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    getInfo.user = userId;
    //const userUploadedFiles = await this.pspService.listFiles(userId, 2);
    //getInfo.RequestMerchantDocument = [...userUploadedFiles.data];
    getInfo.RequestMerchantDocument = [];
    return this.pspService.updatePos(getInfo);
  }

  @Post('update/request/document')
  async updateRequestDocument(@Body() getInfo: MerchantPspRequestDto, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    getInfo.user = userId;
    return this.pspService.updateRequestDocument(getInfo);
  }

  @Post('detail/requestByFollowupCode')
  async GetRequestDetailByFollowupCode(@Body() getInfo: GetRequestDetailByFollowupCodeDto, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    getInfo.user = userId;
    return this.pspService.getRequestByFollowUpCode(getInfo);
  }
  @Post('detail/requestByNationalCode')
  async GetRequestDetailByCode(@Body() getInfo: GetRequestDetailByFollowupCodeDto, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    getInfo.user = userId;
    return this.pspService.GetRequestListlByCustomerCode(getInfo);
  }

  @Post('detail/requestByProductSerial')
  async GetRequestListlByProductSerial(@Body() getInfo: GetRequestDetailByFollowupCodeDto, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    getInfo.user = userId;
    return this.pspService.GetRequestListlByProductSerial(getInfo);
  }
  @Post('pos/bindTerminal')
  async BindPosSerialToTerminal(@Body() getInfo, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    getInfo.user = userId;
    getInfo.merchant = getInfo.customerId;
    return this.pspService.BindPosSerialToTerminal(getInfo);
  }

  @Post('pos/bounds')
  async BoundPos(@Body() getInfo, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    getInfo.user = userId;
    getInfo.merchant = getInfo.customerId;
    const page = await this.generalService.getPage(req);
    const limit = await this.generalService.getPageLimit(req);
    return this.pspService.BoundPoses(getInfo, page, limit);
  }

  @Post('document/list')
  async docList(@Body() getInfo, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.pspService.listFiles(
      userId,
      isNaN(parseInt(getInfo.documentType)) ? 0 : parseInt(getInfo.documentType),
      getInfo.customerId,
      isNaN(parseInt(getInfo.type)) ? 0 : parseInt(getInfo.type)
    );
  }

  @Get('customer/list')
  async customerList(@Body() getInfo, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    const limit = await this.generalService.getPageLimit(req);
    return this.pspService.listCustomer(userId, page, limit);
  }

  @Post('request/list')
  async posList(@Body() getInfo, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    const limit = await this.generalService.getPageLimit(req);
    let customerId = null;
    if (!!getInfo.customerId && mongoose.isValidObjectId(getInfo.customerId)) {
      customerId = getInfo.customerId;
    }
    return this.pspService.listPos(userId, customerId, page, limit === 0 ? 20 : limit);
  }

  @Post('file/upload')
  async uploadFile(@Body() getInfo, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const documentType =
      !!getInfo.documentType && !isNaN(parseInt(getInfo.documentType)) ? parseInt(getInfo.documentType) : 1;
    const customerId = getInfo.customerId;
    return this.pspService.uploadDocument(userId, customerId, parseInt(getInfo.type), req, documentType);
  }

  @Get('country/list')
  async getCountryList(@Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const page = await this.generalService.getPageFromZero(req);
    const limit = await this.generalService.getPageLimit(req);
    return this.pspService.listCountries({ page, limit });
  }

  @Get('city/list')
  async getCityList(@Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const page = await this.generalService.getPageFromZero(req);
    const limit = await this.generalService.getPageLimit(req);
    return this.pspService.listCities({ page, limit });
  }

  @Get('guilds/list')
  async getGuildList(@Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const page = await this.generalService.getPageFromZero(req);
    const limit = await this.generalService.getPageLimit(req);
    return this.pspService.getGuildList({ page, limit });
  }

  @Get('pos/list')
  async getPosTypes(@Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const page = await this.generalService.getPageFromZero(req);
    const limit = await this.generalService.getPageLimit(req);
    return this.pspService.getPosTypes({ page, limit });
  }

  @Get('pos-model/list')
  async getPosModelList(@Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const page = await this.generalService.getPageFromZero(req);
    const limit = await this.generalService.getPageLimit(req);
    return this.pspService.getPosModelList({ page, limit });
  }

  @Get('bank/list')
  async getBankList(@Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const page = await this.generalService.getPageFromZero(req);
    const limit = await this.generalService.getPageLimit(req);
    return this.pspService.listBanks({ page, limit });
  }

  @Get('branches/list')
  async getBranchesList(@Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const page = await this.generalService.getPageFromZero(req);
    const limit = await this.generalService.getPageLimit(req);
    const bankId = await this.generalService.getBankId(req);
    return this.pspService.listBranches({ page, limit, bankId });
  }
}
