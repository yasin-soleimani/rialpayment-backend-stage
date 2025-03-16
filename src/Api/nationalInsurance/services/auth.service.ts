import { Injectable, successOptWithDataNoValidation, NotFoundException } from '@vision/common';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { invalidUserPassException } from '@vision/common/exceptions/invalid-userpass.exception';
import { NationalCoreService } from '../../../Core/national/services/national.service';
import { NationalInsuranceCompleteService } from '../../../Core/insurance/module/complete.insurance';
import { NationalInsuranceCategoryService } from '../../../Core/insurance/services/category.service';
import { NationalInsurancePriceCommonCoreService } from '../../../Core/insurance/services/price.service';
import { NationalInsuranceCalcApiService } from './calc.service';
import { getIp } from '../../../Guard/ip.decoration';

@Injectable()
export class NationalInsuranceAuthApiService {
  constructor(
    private readonly userService: UserService,
    private readonly nationalService: NationalCoreService,
    private readonly completeInsurance: NationalInsuranceCalcApiService,
    private readonly categoryService: NationalInsuranceCategoryService,
    private readonly priceService: NationalInsurancePriceCommonCoreService
  ) {}

  async getNationalInformation(nationalcode: string, category: string): Promise<any> {
    // const userInfo = await this.nationalService.getInfoByIdCode( nationalcode );

    // if ( !userInfo )
    //   throw new UserCustomException('یافت نشد ', false, 404 );

    // if ( !userInfo.nationalcode || userInfo.nationalcode.length !=8 )
    //   throw new UserCustomException('کاربر نامعتبر');

    const categoryInfo = await this.priceService.getCategoryPrice(category);
    if (!categoryInfo) throw new UserCustomException('محصول نامعتبر');

    const nationalInfo = await this.nationalService.getInfoByIdCode(nationalcode);

    if (!isEmpty(nationalInfo)) throw new NotFoundException();

    const complete = await this.completeInsurance.calc(
      categoryInfo.division,
      nationalInfo.familymembersno,
      categoryInfo.type
    );

    return successOptWithDataNoValidation({
      person: complete,
      firstname: nationalInfo.firstname,
      lastname: nationalInfo.lastname,
      father: nationalInfo.father,
      sex: nationalInfo.sex,
      marriage: nationalInfo.marriage,
      place: nationalInfo.place,
      visatype: nationalInfo.visatype,
      passport: nationalInfo.passport,
      amayesh: nationalInfo.amayesh,
      residencetype: nationalInfo.residencetype,
      otherresidencetype: nationalInfo.otherresidencetype,
      economiccode: nationalInfo.economiccode,
      job: nationalInfo.job,
      education: nationalInfo.education,
      familymembersno: nationalInfo.familymembersno,
      tel: nationalInfo.tel,
      mobile: nationalInfo.mobile,
      address: nationalInfo.address,
      postalcode: nationalInfo.postalcode,
      birthdate: nationalInfo.birthdate,
      visaexpire: nationalInfo.visaexpire,
      status: nationalInfo.status,
      sheba: nationalInfo.sheba,
      familycode: nationalInfo.familycode,
      _id: nationalInfo._id,
    });
  }
  async checkLogin(mobile: number, password: string, req): Promise<any> {
    if (isEmpty(mobile) || isEmpty(password)) throw new FillFieldsException();

    const userInfo = await this.userService.getInfoByMobile(mobile);
    if (!userInfo) throw new UserCustomException('کاربر یافت نشد', false, 404);

    // if ( !userInfo.nationalcode || userInfo.nationalcode.length !=8 )
    //   throw new UserCustomException('کاربر نامعتبر');

    const checkValid = await this.userService.compareHash(password, userInfo.password);
    if (!checkValid) throw new invalidUserPassException();

    const userRequest = getIp(req);
    const token = await this.userService.createToken(userInfo._id, userRequest.userAgent, userRequest.ip);
    return successOptWithDataNoValidation({
      fullname: userInfo.fullname,
      mobile: userInfo.mobile,
      token: token.accessToken,
    });
  }
}
