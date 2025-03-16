import {
  Injectable,
  NotFoundException,
  successOptWithDataNoValidation,
  successOpt,
  InternalServerErrorException,
  successOptWithPagination,
} from '@vision/common';
import { NationalInsuranceCoreService } from '../../Core/insurance/insurance.service';
import { NationalInsuranceApiDto } from './dto/insurance.dto';
import { NationalInsuranceCompanyCommonService } from '../../Core/insurance/services/company.service';
import { NationalInsuranceCategoryService } from '../../Core/insurance/services/category.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { NationalInsuranceCategoryApiDto } from './dto/insurance-category.dto';
import { NationalInsurancePriceCommonCoreService } from '../../Core/insurance/services/price.service';
import { NationalInsuranceCategoryList } from './functions/category-list.function';
import { NationalInsuranceListItearor } from './functions/insurance-list.funtion';
import { IpgCoreService } from '../../Core/ipg/ipgcore.service';
import { NationalInsuranceMakeExcelApiService } from './services/excel.service';

@Injectable()
export class NationalInsuranceApiService {
  constructor(
    private readonly insuranceService: NationalInsuranceCoreService,
    private readonly companyServce: NationalInsuranceCompanyCommonService,
    private readonly categoryService: NationalInsuranceCategoryService,
    private readonly priceService: NationalInsurancePriceCommonCoreService,
    private readonly excelService: NationalInsuranceMakeExcelApiService,
    private readonly ipgService: IpgCoreService
  ) {}

  async new(getInfo: NationalInsuranceApiDto): Promise<any> {
    return this.insuranceService.submit(getInfo);
  }

  async getList(company: string): Promise<any> {
    if (isEmpty(company)) throw new FillFieldsException();

    const companyInfo = await this.companyServce.getInfo(company);
    if (!companyInfo) throw new NotFoundException();
    if (companyInfo.status === false) throw new UserCustomException('غیرفعال میباشد');

    const categoryData = await this.categoryService.getListCompany(company);
    if (!categoryData) throw new NotFoundException();

    return successOptWithDataNoValidation(categoryData);
  }

  async addCategory(getInfo: NationalInsuranceCategoryApiDto, userid: string, req): Promise<any> {
    const companyInfo = await this.companyServce.getInfoByUserId(userid);
    if (!companyInfo) throw new UserCustomException('شما دسترسی به این قسمت را ندارید');

    if (isEmpty(getInfo.title)) throw new FillFieldsException();

    delete getInfo.logo;
    getInfo.code = 1;
    getInfo.company = companyInfo._id;

    return this.insuranceService
      .addNewCategory(getInfo)
      .then((res) => {
        if (!res) throw new InternalServerErrorException();
        return this.priceService.new(getInfo.type, getInfo.price, getInfo.division, res._id).then((result) => {
          return successOpt();
        });
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }

  async updateCategory(getInfo: NationalInsuranceCategoryApiDto, userid: string): Promise<any> {
    const companyInfo = await this.companyServce.getInfoByUserId(userid);
    if (!companyInfo) throw new UserCustomException('شما دسترسی به این قسمت را ندارید');

    if (isEmpty(getInfo.title) || isEmpty(getInfo.id)) throw new FillFieldsException();

    if (companyInfo.user != userid) throw new UserCustomException('متاسفانه شما به این قسمت دسترسی ندارید', false, 401);
    getInfo.company = companyInfo._id;

    return this.insuranceService
      .updateCategory(getInfo)
      .then((res) => {
        if (!res) throw new InternalServerErrorException();
        return this.priceService.new(getInfo.type, getInfo.price, getInfo.division, res._id).then((result) => {
          return successOpt();
        });
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }

  async getCategortList(userid: string): Promise<any> {
    const companyInfo = await this.companyServce.getInfoByUserId(userid);
    if (!companyInfo) throw new UserCustomException('شما دسترسی به این قسمت را ندارید');
    if (companyInfo.user != userid) throw new UserCustomException('متاسفانه شما به این قسمت دسترسی ندارید', false, 401);

    const data = await this.categoryService.getList(companyInfo._id);

    return successOptWithDataNoValidation(NationalInsuranceCategoryList(data));
  }

  async getListInsurance(userid: string, page: number): Promise<any> {
    const companyInfo = await this.companyServce.getInfoByUserId(userid);
    if (!companyInfo) throw new UserCustomException('شما دسترسی به این قسمت را ندارید');
    if (companyInfo.user != userid) throw new UserCustomException('متاسفانه شما به این قسمت دسترسی ندارید', false, 401);

    const data = await this.insuranceService.getInsuranceList(companyInfo._id, page);
    data.docs = NationalInsuranceListItearor(data.docs);
    return successOptWithPagination(data);
  }

  async confirmTrax(userinvoice: string): Promise<any> {
    if (isEmpty(userinvoice)) throw new FillFieldsException();
    const traxInfo = await this.ipgService.findByInvoiceid(userinvoice);
    console.log(traxInfo, 'tt');
    if (!traxInfo) throw new UserCustomException('تراکنش یافت نشد');
    const traxStatus = await this.ipgService.verify(traxInfo.terminalid, traxInfo.userinvoice);
    if (traxStatus.success !== true) throw new UserCustomException(traxStatus.message);
    await this.insuranceService.addIpgConfirm(traxInfo.invoiceid, traxInfo._id);
    return successOptWithDataNoValidation({
      ref: traxInfo.userinvoice,
      amount: traxInfo.total,
      createdAt: traxInfo.createdAt,
    });
  }

  async getExcel(id: string): Promise<any> {
    return this.excelService.single(id);
  }
}
