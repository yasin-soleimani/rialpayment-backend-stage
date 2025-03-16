import { Injectable, InternalServerErrorException, successOpt } from '@vision/common';
import { UserService } from '../../useraccount/user/user.service';
import { AccountService } from '../../useraccount/account/account.service';
import { GroupCoreService } from '../../group/group.service';
import { SimcardChargeCoreDto } from '../dto/charge.dto';
import { OrganizationPoolCoreService } from '../../organization/pool/pool.service';
import { SimcardCommonCoreService } from './common.service';
import { elkapoParams, simcardOperator, simcardType } from '@vision/common/constants/simcard.const';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { OrganizationNewChargeCoreService } from '../../organization/new-charge/charge.service';
import { PurchaseSimcardPackageDto } from '../../../Api/charge/dto/buy-simcard-package.dto';
import { QPinApiService } from './qpin-apis.service';
import { returnQpinPurchasePackageData } from '../../../Api/charge/function/qpin-purchase-packege-data.func';
import { SimcardChargeQpinDto } from '../../../Api/charge/dto/simcard.dto';
import { returnQpinPurchaseChargeData } from '../../../Api/charge/function/qpin-purchase-charge-data.func';

@Injectable()
export class SimcardChargeOrganizationServcie {
  constructor(
    private readonly accountService: AccountService,
    private readonly userService: UserService,
    private readonly groupService: GroupCoreService,
    private readonly poolService: OrganizationPoolCoreService,
    private readonly orgChargeService: OrganizationNewChargeCoreService,
    private readonly commonService: SimcardCommonCoreService,
    private readonly qpinApiService: QPinApiService
  ) {}

  async getPlay(getInfo: SimcardChargeCoreDto | PurchaseSimcardPackageDto, userid: string, qpin = false): Promise<any> {
    const groupInfo = await this.groupService.getGroupByUserId(userid);
    if (!groupInfo) return false;

    const pool = await this.poolService.getPoolInfoByGroupId(groupInfo.group);
    if (!pool) return false;

    if (pool.charge == false) return false;

    const poolInfo = await this.poolService.getLastTurnOver(pool._id);

    const balance = await this.orgChargeService.getUserBalance(userid, pool._id);
    if (!balance) return false;

    if (balance.remain < 1) return false;

    if (balance.remain >= getInfo.amount) {
      return qpin
        ? this.OnceQpin(getInfo as PurchaseSimcardPackageDto, userid, poolInfo, balance)
        : this.Once(getInfo, userid, poolInfo, balance);
    } else {
      return qpin
        ? this.TwiceQpin(getInfo as PurchaseSimcardPackageDto, userid, poolInfo, balance)
        : this.Twice(getInfo, userid, poolInfo, balance);
    }
  }

  async getPlayQpinRecharge(getInfo: SimcardChargeQpinDto, userid: string): Promise<any> {
    const groupInfo = await this.groupService.getGroupByUserId(userid);
    if (!groupInfo) return false;

    const pool = await this.poolService.getPoolInfoByGroupId(groupInfo.group);
    if (!pool) return false;

    if (pool.charge == false) return false;

    const poolInfo = await this.poolService.getLastTurnOver(pool._id);

    const balance = await this.orgChargeService.getUserBalance(userid, pool._id);
    if (!balance) return false;

    if (balance.remain < 1) return false;

    if (balance.remain >= getInfo.amount) {
      return this.OnceQpinRecharge(getInfo, userid, poolInfo, balance);
    } else {
      return this.TwiceQpinRecharge(getInfo, userid, poolInfo, balance);
    }
  }

  private async TwiceQpinRecharge(
    getInfo: SimcardChargeQpinDto,
    userid: string,
    poolInfo: any,
    balance: any
  ): Promise<any> {
    const walletDecharge = Number(getInfo.amount) - balance.remain;
    if (poolInfo.remain < walletDecharge) return false;

    await this.commonService.checkBalance(userid, walletDecharge);
    const clientTransactionId = new Date().getTime().toString();
    getInfo.clientTransactionId = clientTransactionId;
    const data = returnQpinPurchaseChargeData(getInfo);

    try {
      await this.commonService.newInQpin(userid, getInfo.mobile, getInfo.amount, clientTransactionId);
      const response = await this.qpinApiService.simcardRecharge(data);
      await this.commonService.updateRes(userid, clientTransactionId, JSON.stringify(response.data));
      await this.accountService.dechargeAccount(userid, 'wallet', walletDecharge);
      const setResult = await this.commonService.setLogOrganization(
        getInfo.mobile,
        userid,
        walletDecharge,
        balance.remain
      );
      await this.poolService.decharge(poolInfo.pool, balance.remain, userid, setResult.title, null, setResult.ref);
      await this.orgChargeService.dechargeUser(userid, balance.remain, null, setResult.title, poolInfo.pool);
      await this.accountService.dechargeAccount(userid, 'org', balance.remain);

      return successOpt();
    } catch (e) {
      if (e.hasOwnProperty('response')) {
        await this.commonService.updateRes(userid, clientTransactionId, JSON.stringify(e.response.data));
      }
      const microServiceResponse = e.response?.data;
      const detailsErrorMessage = microServiceResponse.result?.ResponseException?.ErrorDetails[0].Message;
      const commonErrorMessage = microServiceResponse.result?.Message;
      const responseMessage = detailsErrorMessage ?? commonErrorMessage;
      throw new InternalServerErrorException(responseMessage ?? 'خطای سرور');
    }
  }

  private async OnceQpinRecharge(
    getInfo: SimcardChargeQpinDto,
    userid: string,
    poolInfo: any,
    balance: any
  ): Promise<any> {
    if (poolInfo.remain < Number(getInfo.amount)) return false;
    if (balance.remain < Number(getInfo.amount)) return false;

    const clientTransactionId = new Date().getTime().toString();
    getInfo.clientTransactionId = clientTransactionId;
    const data = returnQpinPurchaseChargeData(getInfo);

    try {
      await this.commonService.newInQpin(userid, getInfo.mobile, getInfo.amount, clientTransactionId);
      const response = await this.qpinApiService.simcardRecharge(data);
      await this.commonService.updateRes(userid, clientTransactionId, JSON.stringify(response.data));
      const setResult = await this.commonService.setLogOrganization(getInfo.mobile, userid, 0, getInfo.amount);

      await this.poolService.decharge(
        poolInfo.pool,
        Number(getInfo.amount),
        userid,
        setResult.title,
        null,
        setResult.ref
      );
      await this.orgChargeService.dechargeUser(userid, Number(getInfo.amount), null, setResult.title, poolInfo.pool);
      await this.accountService.dechargeAccount(userid, 'org', Number(getInfo.amount));

      return successOpt();
    } catch (e) {
      if (e.hasOwnProperty('response')) {
        await this.commonService.updateRes(userid, clientTransactionId, JSON.stringify(e.response.data));
      }
      const microServiceResponse = e.response?.data;
      const detailsErrorMessage = microServiceResponse.result?.ResponseException?.ErrorDetails[0].Message;
      const commonErrorMessage = microServiceResponse.result?.Message;
      const responseMessage = detailsErrorMessage ?? commonErrorMessage;
      throw new InternalServerErrorException(responseMessage ?? 'خطای سرور');
    }
  }

  private async TwiceQpin(
    getInfo: PurchaseSimcardPackageDto,
    userid: string,
    poolInfo: any,
    balance: any
  ): Promise<any> {
    const walletDecharge = Number(getInfo.amount) - balance.remain;
    if (poolInfo.remain < walletDecharge) return false;

    await this.commonService.checkBalance(userid, walletDecharge);
    const clientTransactionId = new Date().getTime().toString();
    getInfo.clientTransactionId = clientTransactionId;
    const data = returnQpinPurchasePackageData(getInfo);

    try {
      await this.commonService.newInQpin(userid, getInfo.mobile, getInfo.amount, clientTransactionId);
      const response = await this.qpinApiService.purchaseSimcardPackage(data);
      await this.commonService.updateRes(userid, clientTransactionId, JSON.stringify(response.data));
      await this.accountService.dechargeAccount(userid, 'wallet', walletDecharge);
      const setResult = await this.commonService.setLogOrganizationPackagePurchase(
        getInfo.mobile,
        userid,
        walletDecharge,
        balance.remain
      );
      await this.poolService.decharge(poolInfo.pool, balance.remain, userid, setResult.title, null, setResult.ref);
      await this.orgChargeService.dechargeUser(userid, balance.remain, null, setResult.title, poolInfo.pool);
      await this.accountService.dechargeAccount(userid, 'org', balance.remain);

      return successOpt();
    } catch (e) {
      if (e.hasOwnProperty('response')) {
        await this.commonService.updateRes(userid, clientTransactionId, JSON.stringify(e.response.data));
      }
      const microServiceResponse = e.response?.data;
      const detailsErrorMessage = microServiceResponse.result?.ResponseException?.ErrorDetails[0].Message;
      const commonErrorMessage = microServiceResponse.result?.Message;
      const responseMessage = detailsErrorMessage ?? commonErrorMessage;
      throw new InternalServerErrorException(responseMessage ?? 'خطای سرور');
    }
  }

  private async OnceQpin(
    getInfo: PurchaseSimcardPackageDto,
    userid: string,
    poolInfo: any,
    balance: any
  ): Promise<any> {
    if (poolInfo.remain < Number(getInfo.amount)) return false;
    if (balance.remain < Number(getInfo.amount)) return false;

    const clientTransactionId = new Date().getTime().toString();
    getInfo.clientTransactionId = clientTransactionId;
    const data = returnQpinPurchasePackageData(getInfo);

    try {
      await this.commonService.newInQpin(userid, getInfo.mobile, getInfo.amount, clientTransactionId);
      const response = await this.qpinApiService.purchaseSimcardPackage(data);
      await this.commonService.updateRes(userid, clientTransactionId, JSON.stringify(response.data));
      const setResult = await this.commonService.setLogOrganizationPackagePurchase(
        getInfo.mobile,
        userid,
        0,
        getInfo.amount
      );

      await this.poolService.decharge(
        poolInfo.pool,
        Number(getInfo.amount),
        userid,
        setResult.title,
        null,
        setResult.ref
      );
      await this.orgChargeService.dechargeUser(userid, Number(getInfo.amount), null, setResult.title, poolInfo.pool);
      await this.accountService.dechargeAccount(userid, 'org', Number(getInfo.amount));

      return successOpt();
    } catch (e) {
      if (e.hasOwnProperty('response')) {
        await this.commonService.updateRes(userid, clientTransactionId, JSON.stringify(e.response.data));
      }
      const microServiceResponse = e.response?.data;
      const detailsErrorMessage = microServiceResponse.result?.ResponseException?.ErrorDetails[0].Message;
      const commonErrorMessage = microServiceResponse.result?.Message;
      const responseMessage = detailsErrorMessage ?? commonErrorMessage;
      throw new InternalServerErrorException(responseMessage ?? 'خطای سرور');
    }
  }

  private async Twice(getInfo: SimcardChargeCoreDto, userid: string, poolInfo: any, balance: any): Promise<any> {
    const walletDecharge = Number(getInfo.amount) - balance.remain;
    if (poolInfo.remain < walletDecharge) return false;

    await this.commonService.checkBalance(userid, walletDecharge);
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

    await this.accountService.dechargeAccount(userid, 'wallet', walletDecharge);
    const setResult = await this.commonService.setLogOrganization(
      getInfo.mobile,
      userid,
      walletDecharge,
      balance.remain
    );
    await this.poolService.decharge(poolInfo.pool, balance.remain, userid, setResult.title, null, setResult.ref);
    await this.orgChargeService.dechargeUser(userid, balance.remain, null, setResult.title, poolInfo._id);
    await this.accountService.dechargeAccount(userid, 'org', balance.remain);

    return successOpt();
  }

  private async Once(getInfo: SimcardChargeCoreDto, userid: string, poolInfo: any, balance: any): Promise<any> {
    if (poolInfo.remain < Number(getInfo.amount)) return false;

    if (balance.remain < Number(getInfo.amount)) return false;
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
    const setResult = await this.commonService.setLogOrganization(getInfo.mobile, userid, 0, getInfo.amount);

    await this.poolService.decharge(
      poolInfo.pool,
      Number(getInfo.amount),
      userid,
      setResult.title,
      null,
      setResult.ref
    );
    await this.orgChargeService.dechargeUser(userid, Number(getInfo.amount), null, setResult.title, poolInfo._id);
    await this.accountService.dechargeAccount(userid, 'org', Number(getInfo.amount));

    return successOpt();
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
