import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@vision/common';
import { NationalInsuranceDto } from './dto/insurance.dto';
import { NationalCoreService } from '../national/services/national.service';
import { UserService } from '../useraccount/user/user.service';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { NationalInsuranceCommonService } from './services/insurance.service';
import { isArray } from 'util';
import { nationalInsuranceCodeConst } from './const/nationalInsurance.const';
import { NationalInsuranceCategoryService } from './services/category.service';
import { NationalInsuranceCompleteService } from './module/complete.insurance';
import { NationalInsuranceCategoryCoreDto } from './dto/insurance-category.dto';

@Injectable()
export class NationalInsuranceCoreService {
  constructor(
    private readonly categoryService: NationalInsuranceCategoryService,
    private readonly insuranceService: NationalInsuranceCommonService,
    private readonly completeInsuranceService: NationalInsuranceCompleteService
  ) {}

  async submit(getInfo: NationalInsuranceDto): Promise<any> {
    const categoryInfo = await this.categoryService.getInfoByCatId(getInfo.category);
    console.log(categoryInfo, 'categoryInfo');
    if (!categoryInfo) throw new NotFoundException();

    switch (categoryInfo.code) {
      case nationalInsuranceCodeConst.CompleteInsurance: {
        return this.completeInsuranceService.play(getInfo);
      }

      default: {
        throw new InternalServerErrorException();
      }
    }

    // return this.insuranceService.new( getInfo, 100000, 5, '546546546','sadsa');
  }

  async addNewCategory(getInfo: NationalInsuranceCategoryCoreDto): Promise<any> {
    return this.categoryService.new(getInfo);
  }

  async updateCategory(getInfo: NationalInsuranceCategoryCoreDto): Promise<any> {
    return this.categoryService.update(getInfo);
  }

  async getListCategory(companyid: string): Promise<any> {
    return this.categoryService.getListByCompanyId(companyid);
  }

  async getInsuranceList(companyid: string, page: number): Promise<any> {
    return this.insuranceService.getList(companyid, page);
  }

  async addIpgConfirm(invoiceid: string, ipgid: string): Promise<any> {
    return this.insuranceService.addPaid(invoiceid, ipgid);
  }

  async getInsuranceInfoById(id: string): Promise<any> {
    return this.insuranceService.getInfoById(id);
  }
}
