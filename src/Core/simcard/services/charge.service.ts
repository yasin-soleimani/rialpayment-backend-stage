import { Injectable, InternalServerErrorException, successOpt } from '@vision/common';
import { SimcardChargeCoreDto } from '../dto/charge.dto';
import { SimcardCommonCoreService } from './common.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { elkapoParams, simcardOperator, simcardType } from '@vision/common/constants/simcard.const';
import { AccountService } from '../../useraccount/account/account.service';
import { UserService } from '../../useraccount/user/user.service';
import { SimcardChargeOrganizationServcie } from './organinzation.service';
import { PurchaseSimcardPackageDto } from '../../../Api/charge/dto/buy-simcard-package.dto';
import { returnQpinPurchasePackageData } from '../../../Api/charge/function/qpin-purchase-packege-data.func';
import { QPinApiService } from './qpin-apis.service';
import { SimcardChargeQpinDto } from '../../../Api/charge/dto/simcard.dto';
import { returnQpinPurchaseChargeData } from '../../../Api/charge/function/qpin-purchase-charge-data.func';

@Injectable()
export class SimcardChargeServcie {
  constructor(
    private readonly commonService: SimcardCommonCoreService,
    private readonly accountService: AccountService,
    private readonly organizationService: SimcardChargeOrganizationServcie,
    private readonly userService: UserService,
    private readonly qpinApiService: QPinApiService
  ) {}

  async reqCharge(getInfo: SimcardChargeCoreDto, userid): Promise<any> {
    const userInfo = await this.userService.getInfoByUserid(userid);
    if (userInfo.block == true) throw new UserCustomException('متاسفانه حساب کاربری شما مسدود شده است');
    // const chargeInfo = await this.commonService.getChargeHistory( userInfo._id );
    // if ( chargeInfo && Number(chargeInfo) > 4 ) throw new UserCustomException('متاسفانه سقف خرید شما پر شده است');
    // this.commonService.newIn( userInfo._id, getInfo.mobile, getInfo.amount );
    // if ( !userInfo.fullname ) {
    //   if ( getInfo.amount > 50000 ) throw new UserCustomException('متاسفانه شما بیشتر از 50000 تومان بیشتر در روز نمی توانید  خرید کنید');
    //   const chargeInfo = await this.commonService.getChargeHistory( userInfo._id );
    //   if ( chargeInfo ) throw new UserCustomException('متاسفانه سقف خرید شما پر شده است');
    //   this.commonService.newIn( userInfo._id, getInfo.mobile, getInfo.amount );
    // }
    if (getInfo.amount > 200000) throw new UserCustomException('تا سقف 200000 مجاز می باشد');
    if (getInfo.amount < 10000) throw new UserCustomException('مبلغ باید بیشتر از 10000 ریال باشد');

    // from New Organization Charge
    const org = await this.organizationService.getPlay(getInfo, userid);
    if (org) return org;

    await this.commonService.checkBalance(userid, getInfo.amount);
    const tt = new Date().getTime();
    const ServiceType = await this.paramsSelector(getInfo.type, getInfo.operator);
    const data = await this.commonService.recharge(
      getInfo.mobile,
      getInfo.amount,
      ServiceType.service,
      ServiceType.params,
      tt
    );
    if (data.ResultCode != 0) throw new UserCustomException('متاسفانه عملیات با خطا مواجه شده است', false, 500);
    this.accountService.dechargeAccount(userid, 'wallet', getInfo.amount);
    await this.commonService.setLogg(getInfo.mobile, userid, getInfo.amount);
    const discount = Math.round((3 * getInfo.amount) / 100);
    this.accountService.chargeAccount(userid, 'wallet', discount);
    this.accountService.accountSetLogg('هدیه خرید شارژ سیم کارت', 'Gift', discount, true, null, userid);
    return successOpt();
  }

  async reqRecharge(getInfo: SimcardChargeQpinDto, userid: string): Promise<any> {
    const userInfo = await this.userService.getInfoByUserid(userid);
    if (userInfo.block == true) throw new UserCustomException('متاسفانه حساب کاربری شما مسدود شده است');
    // const chargeInfo = await this.commonService.getChargeHistory( userInfo._id );
    // if ( chargeInfo && Number(chargeInfo) > 4 ) throw new UserCustomException('متاسفانه سقف خرید شما پر شده است');
    // this.commonService.newIn( userInfo._id, getInfo.mobile, getInfo.amount );
    // if ( !userInfo.fullname ) {
    //   if ( getInfo.amount > 50000 ) throw new UserCustomException('متاسفانه شما بیشتر از 50000 تومان بیشتر در روز نمی توانید  خرید کنید');
    //   const chargeInfo = await this.commonService.getChargeHistory( userInfo._id );
    //   if ( chargeInfo ) throw new UserCustomException('متاسفانه سقف خرید شما پر شده است');
    //   this.commonService.newIn( userInfo._id, getInfo.mobile, getInfo.amount );
    // }
    if (getInfo.amount > 200000) throw new UserCustomException('تا سقف 200000 مجاز می باشد');
    if (getInfo.amount < 10000) throw new UserCustomException('مبلغ باید بیشتر از 10000 ریال باشد');

    // from New Organization Charge
    const org = await this.organizationService.getPlayQpinRecharge(getInfo, userid);
    if (org) return org;

    // if could not pay with organization credit, then try to pay with wallet
    await this.commonService.checkBalance(userid, getInfo.amount);
    const clientTransactionId = new Date().getTime().toString();
    getInfo.clientTransactionId = clientTransactionId.toString();

    const qpinPurchaseChargeData = returnQpinPurchaseChargeData(getInfo);

    try {
      await this.commonService.newInQpin(userid, getInfo.mobile, getInfo.amount, clientTransactionId);
      const response = await this.qpinApiService.simcardRecharge(qpinPurchaseChargeData);
      await this.commonService.updateRes(userid, clientTransactionId, JSON.stringify(response.data));
      this.accountService.dechargeAccount(userid, 'wallet', getInfo.amount);
      await this.commonService.setLogg(getInfo.mobile, userid, getInfo.amount);
      const discount = Math.round((3 * getInfo.amount) / 100);
      this.accountService.chargeAccount(userid, 'wallet', discount);
      this.accountService.accountSetLogg('هدیه خرید شارژ سیم کارت', 'Gift', discount, true, null, userid);
      return successOpt();
    } catch (e) {
      if (e.hasOwnProperty('response')) {
        await this.commonService.updateRes(userid, clientTransactionId, JSON.stringify(e.response.data));
      }
      const microServiceResponse = e.response?.data;
      const detailsErrorMessage = microServiceResponse.result?.ResponseException?.ErrorDetails[0].Message;
      const commonErrorMessage = microServiceResponse.result?.Message;
      const responseMessage = detailsErrorMessage ?? commonErrorMessage;
      throw new InternalServerErrorException(responseMessage);
    }
  }

  async reqPurchasePackage(getInfo: PurchaseSimcardPackageDto, userid: string): Promise<any> {
    const userInfo = await this.userService.getInfoByUserid(userid);
    if (userInfo.block == true) throw new UserCustomException('متاسفانه حساب کاربری شما مسدود شده است');
    // const chargeInfo = await this.commonService.getChargeHistory( userInfo._id );
    // if ( chargeInfo && Number(chargeInfo) > 4 ) throw new UserCustomException('متاسفانه سقف خرید شما پر شده است');
    // this.commonService.newIn( userInfo._id, getInfo.mobile, getInfo.amount );
    // if ( !userInfo.fullname ) {
    //   if ( getInfo.amount > 50000 ) throw new UserCustomException('متاسفانه شما بیشتر از 50000 تومان بیشتر در روز نمی توانید  خرید کنید');
    //   const chargeInfo = await this.commonService.getChargeHistory( userInfo._id );
    //   if ( chargeInfo ) throw new UserCustomException('متاسفانه سقف خرید شما پر شده است');
    //   this.commonService.newIn( userInfo._id, getInfo.mobile, getInfo.amount );
    // }
    // if (getInfo.amount > 200000) throw new UserCustomException('تا سقف 200000 مجاز می باشد');

    // from New Organization Charge
    const org = await this.organizationService.getPlay(getInfo, userid, true);
    if (org) return org;

    // if could not pay with organization credit, then try to pay with wallet
    await this.commonService.checkBalance(userid, getInfo.amount);
    const clientTransactionId = new Date().getTime().toString();
    getInfo.clientTransactionId = clientTransactionId.toString();

    const qpinPurchasePackageData = returnQpinPurchasePackageData(getInfo);

    try {
      await this.commonService.newInQpin(userid, getInfo.mobile, getInfo.amount, clientTransactionId);
      const response = await this.qpinApiService.purchaseSimcardPackage(qpinPurchasePackageData);
      await this.commonService.updateRes(userid, clientTransactionId, JSON.stringify(response.data));
      this.accountService.dechargeAccount(userid, 'wallet', getInfo.amount);
      await this.commonService.setLoggPackagePurchase(getInfo.mobile, userid, getInfo.amount);
      const discount = Math.round((2 * getInfo.amount) / 100);
      this.accountService.chargeAccount(userid, 'wallet', discount);
      this.accountService.accountSetLogg('هدیه خرید بسته اینترنتی', 'Gift', discount, true, null, userid);
      return successOpt();
    } catch (e) {
      if (e.hasOwnProperty('response')) {
        await this.commonService.updateRes(userid, clientTransactionId, JSON.stringify(e.response.data));
      }
      const microServiceResponse = e.response?.data;
      const detailsErrorMessage = microServiceResponse.result?.ResponseException?.ErrorDetails[0].Message;
      const commonErrorMessage = microServiceResponse.result?.Message;
      const responseMessage = detailsErrorMessage ?? commonErrorMessage;
      throw new InternalServerErrorException(responseMessage);
    }
  }

  async testLimit(userid: string): Promise<any> {
    return this.commonService.getChargeHistory(userid);
  }

  private async paramsSelector(type, opt): Promise<any> {
    if (type == 1) {
      return this.operatorSelector(opt);
    } else {
      return this.commonService.imf(elkapoParams.normal, simcardType.creditCharge);
    }
  }

  private async operatorSelector(opt): Promise<any> {
    console.log(parseInt(opt));
    switch (parseInt(opt)) {
      case simcardOperator.HamrahAval: {
        return this.commonService.imf(elkapoParams.normal, simcardType.creditCharge);
      }

      case simcardOperator.Irancell: {
        return this.commonService.imf(elkapoParams.irancell, simcardType.creditCharge);
      }

      case simcardOperator.Rightel: {
        return this.commonService.imf(elkapoParams.rightel, simcardType.creditCharge);
      }
    }
  }
}
