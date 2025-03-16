import { Injectable, successOptWithDataNoValidation } from '@vision/common';
import { SimcardOperatorIdEnum } from './constants/simcard-operator-id.enum';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { PurchaseSimcardPackageDto } from './dto/buy-simcard-package.dto';
import { QPinApiService } from '../../Core/simcard/services/qpin-apis.service';
import { SimcardChargeServcie } from '../../Core/simcard/services/charge.service';
import { SimcardChargeQpinDto } from './dto/simcard.dto';

@Injectable()
export class ApiSimcardService {
  constructor(
    private readonly QpinApiService: QPinApiService,
    private readonly simcardChargeService: SimcardChargeServcie
  ) {}

  async getSimcardPackageCategories(mobileOperatorId: SimcardOperatorIdEnum, userid: string): Promise<any> {
    let parsedOperatorId = Number(mobileOperatorId);

    if (Number.isNaN(parsedOperatorId)) {
      throw new FillFieldsException();
    }

    const result = await this.QpinApiService.getSimcardPackageCategories(mobileOperatorId);
    return successOptWithDataNoValidation(result.data.response.result.Result);
  }

  async getSimcardPackages(categoryCode: number, userid: string): Promise<any> {
    let parsedCategoryCode = Number(categoryCode);

    if (Number.isNaN(parsedCategoryCode)) {
      throw new FillFieldsException();
    }

    const result = await this.QpinApiService.getSimcardPackages(categoryCode);
    return successOptWithDataNoValidation(result.data.response.result.Result);
  }

  async rechargeSimcard(data: SimcardChargeQpinDto, userid: string): Promise<any> {
    if (
      typeof data.amount !== 'number' ||
      !data.mobile ||
      !data.operator ||
      data.rechargeCode === undefined ||
      data.rechargeCode === null
    ) {
      throw new FillFieldsException();
    }

    return this.simcardChargeService.reqRecharge(data, userid);
  }

  async buySimcardPackage(data: PurchaseSimcardPackageDto, userid: string): Promise<any> {
    if (typeof data.amount !== 'number' || !data.mobile || typeof data.operator !== 'number' || !data.packageCode)
      throw new FillFieldsException();

    return this.simcardChargeService.reqPurchasePackage(data, userid);
  }
}
