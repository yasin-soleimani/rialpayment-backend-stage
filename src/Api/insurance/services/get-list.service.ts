import { Injectable, successOptWithDataNoValidation } from '@vision/common';
import { MainInsuranceCategoryCoreService } from '../../../Core/main-insurance/services/category.service';
import { MainInsuranceProductCoreService } from '../../../Core/main-insurance/services/products.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

@Injectable()
export class InsuranceGetListApiService {
  constructor(
    private readonly categoryService: MainInsuranceCategoryCoreService,
    private readonly productsService: MainInsuranceProductCoreService
  ) {}

  async getList(code: number): Promise<any> {
    const catData = await this.categoryService.getInfoByCode(code);
    if (!catData) throw new UserCustomException('اطلاعات اشتباه است', false, 500);

    const list = await this.productsService.getList(catData._id);
    return list;
  }
}
