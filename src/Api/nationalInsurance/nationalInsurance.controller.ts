import { Controller, Post, Body, Get, Req, Put } from '@vision/common';
import { NationalInsuranceApiService } from './nationalInsurance.service';
import { NationalInsuranceApiDto } from './dto/insurance.dto';
import { GeneralService } from '../../Core/service/general.service';
import { NationalInsuranceCategoryApiDto } from './dto/insurance-category.dto';

@Controller('nationalinsurance')
export class NartionalInsuranceController {
  constructor(
    private readonly insuranceService: NationalInsuranceApiService,
    private readonly generalService: GeneralService
  ) {}

  @Get('company')
  async getCompany(@Req() req): Promise<any> {
    const id = await this.generalService.getID(req);
    return this.insuranceService.getList(id);
  }

  @Post()
  async submitNew(@Body() getInfo: NationalInsuranceApiDto): Promise<any> {
    return this.insuranceService.new(getInfo);
  }

  @Post('category')
  async addNewCategory(@Body() getInfo: NationalInsuranceCategoryApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.insuranceService.addCategory(getInfo, userid, req);
  }

  @Get('category')
  async getCategoryList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.insuranceService.getCategortList(userid);
  }

  @Put('category')
  async updateCategory(@Body() getInfo: NationalInsuranceCategoryApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.insuranceService.updateCategory(getInfo, userid);
  }

  @Get('list')
  async getList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);

    return this.insuranceService.getListInsurance(userid, page);
  }

  @Post('ipg/confirm')
  async confirmIpg(@Body() getInfo): Promise<any> {
    console.log(getInfo);
    return this.insuranceService.confirmTrax(getInfo.ref);
  }

  @Post('excel')
  async getExcel(@Body() getInfo): Promise<any> {
    return this.insuranceService.getExcel(getInfo.id);
  }
}
