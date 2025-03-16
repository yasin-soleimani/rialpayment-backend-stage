import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  successOptWithDataNoValidation,
} from '@vision/common';
import { isArray } from 'util';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { NationalInsuranceDto } from '../dto/insurance.dto';
import { NationalCoreService } from '../../../Core/national/services/national.service';
import { NationalInsurancePriceCommonCoreService } from '../services/price.service';
import { nationalInsuranceDivType } from '../const/nationalInsurance.const';
import { NationalInsuranceCommonService } from '../services/insurance.service';
import { NationalInsuranceCalcApiService } from '../../../Api/nationalInsurance/services/calc.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { getTokenIpg } from '../../../Api/nationalInsurance/functions/payment.function';

@Injectable()
export class NationalInsuranceCompleteService {
  constructor(
    private readonly userService: UserService,
    private readonly nationalService: NationalCoreService,
    private readonly priceService: NationalInsurancePriceCommonCoreService,
    private readonly insuranceService: NationalInsuranceCommonService,
    private readonly calcService: NationalInsuranceCalcApiService
  ) {}

  async play(getInfo: NationalInsuranceDto): Promise<any> {
    if (!isArray(getInfo.persons)) throw new BadRequestException();
    if (getInfo.persons.length < 1) throw new FillFieldsException();
    if (isEmpty(getInfo.customerid)) throw new FillFieldsException();
    if (isEmpty(getInfo.category)) throw new FillFieldsException();

    const userInfo = await this.nationalService.getInfo(getInfo.customerid);
    if (!userInfo) throw new NotFoundException();

    const nationalInfo = await this.nationalService.getInfoByIdCode(userInfo.idcode);
    if (!nationalInfo) throw new NotFoundException();
    // const qty = getInfo.persons.length + 1;

    const priceInfo = await this.priceService.getCategoryPrice(getInfo.category);
    if (!priceInfo) throw new NotFoundException();

    let qty = await this.calcService.calc(priceInfo.division, getInfo.persons.length + 1, priceInfo.type);
    qty++;

    if (nationalInfo.familymembersno < getInfo.persons.length + 1 || getInfo.persons.length + 1 > qty)
      throw new UserCustomException('تعداد اعضا بیش از تعداد ثبت نام شده می باشد');

    const invocieid = 'NI-' + new Date().getTime();

    const total = await this.calc(priceInfo.price, priceInfo.division, qty, priceInfo.type);
    const ipgData = await getTokenIpg(
      '2004458',
      total,
      invocieid,
      'https://atba.rialpayment.ir/purchase-result?ref=' + invocieid
    );
    console.log(priceInfo.category, 'priceInfo.category');
    if (isEmpty(ipgData.invoiceid)) throw new UserCustomException('مشکلی در پرداخت به وجود آمده است');
    const data = await this.insuranceService.new(
      getInfo,
      total,
      qty,
      invocieid,
      getInfo.category,
      priceInfo.category.company
    );

    if (!data) throw new InternalServerErrorException();
    return successOptWithDataNoValidation({
      token: ipgData.invoiceid,
      amount: total,
      qty: qty,
      price: priceInfo.price,
    });
  }

  async calc(perperson: number, divtype: number, qty: number, type: number): Promise<any> {
    return this.divFalse(perperson, qty);
  }
  private divFalse(perperson: number, qty: number) {
    return perperson * qty;
  }
}
