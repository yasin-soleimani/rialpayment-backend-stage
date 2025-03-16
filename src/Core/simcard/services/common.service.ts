import { Injectable, Inject } from '@vision/common';
import * as soap from 'soap';
import { simcard } from '@vision/common/constants/simcard.const';
import { notEnoughMoneyException } from '@vision/common/exceptions/notEnoughMoney.exception';
import { AccountService } from '../../useraccount/account/account.service';
import { Model } from 'mongoose';
import { todayRange, getTodayStartDayUtc, dateRange } from '@vision/common/utils/month-diff.util';
import { AccountBlockService } from '../../../Core/useraccount/account/services/account-block.service';
import { LoggercoreService } from '../../../Core/logger/loggercore.service';

@Injectable()
export class SimcardCommonCoreService {
  constructor(
    @Inject('SimcardModel') private readonly simcardModel: Model<any>,
    private readonly loggerService: LoggercoreService,
    private readonly accountBlockService: AccountBlockService,
    private readonly accountService: AccountService
  ) {}

  async recharge(mobile, amount, service, params, orderid): Promise<any> {
    const client2 = await soap.createClientAsync(simcard.url);
    const data = await client2.RechargeAsync({
      Username: simcard.username,
      Password: simcard.password,
      MobileNumber: mobile,
      Amount: amount,
      Service: service,
      Params: params,
      UserOrderID: orderid,
    });
    console.log(JSON.parse(data[0].RechargeResult));
    return JSON.parse(data[0].RechargeResult);
  }

  async checkBalance(userid, amount): Promise<any> {
    const wallet = await this.accountService.getBalance(userid, 'wallet');
    const block = await this.accountService.getTodayCharge(userid);
    const today = await this.accountBlockService.getBlock(userid);

    let blockAmount = 0;
    if (block.length > 0) {
      blockAmount = block[0].total;
    }

    let todayCharge = 0;
    if (today.length > 0) {
      todayCharge = today[0].total;
    }
    if (!wallet) throw new notEnoughMoneyException();
    const total = wallet.balance - blockAmount - todayCharge;
    if (total < amount) throw new notEnoughMoneyException();
    return true;
  }

  async setLogg(mobile, userid, amount): Promise<any> {
    const title = 'خرید شارژ موبایل ' + mobile;
    return this.accountService.accountSetLogg(title, 'MobileCharge', amount, true, userid, null);
  }

  async setLogOrganization(mobile, userid, amount, organization): Promise<any> {
    let logInfo;
    if (Number(amount) > 0) {
      const title = 'خرید شارژ موبایل ' + mobile;
      logInfo = await this.accountService.accountSetLogg(title, 'MobileCharge', amount, true, userid, null);
    }
    let log = 'MobileCharge-' + new Date().getTime();

    if (logInfo) {
      log = logInfo.ref;
    }
    const titleOrg = 'کسر از اعتبار سازمانی خرید شارژ موبایل' + mobile;
    const orgLog = await this.loggerService.submitNewLoggWithRef(titleOrg, log, organization, true, userid, null, 0, 0);

    return orgLog;
  }

  async setLoggPackagePurchase(mobile, userid, amount): Promise<any> {
    const title = 'خرید بسته اینترنت ' + mobile;
    return this.accountService.accountSetLogg(title, 'InternetPackage', amount, true, userid, null);
  }

  async setLogOrganizationPackagePurchase(mobile, userid, amount, organization): Promise<any> {
    let logInfo;
    if (Number(amount) > 0) {
      const title = 'خرید بسته اینترنت ' + mobile;
      logInfo = await this.accountService.accountSetLogg(title, 'InternetPackage', amount, true, userid, null);
    }
    let log = 'InternetPackage-' + new Date().getTime();

    if (logInfo) {
      log = logInfo.ref;
    }
    const titleOrg = 'کسر از اعتبار سازمانی خرید بسته اینترنت' + mobile;
    const orgLog = await this.loggerService.submitNewLoggWithRef(titleOrg, log, organization, true, userid, null, 0, 0);

    return orgLog;
  }

  imf(params, service) {
    return {
      params: params,
      service: service,
    };
  }

  async newIn(user: string, mobile: string, amount: number): Promise<any> {
    return this.simcardModel.create({
      user: user,
      mobile: mobile,
      amount: amount,
    });
  }

  async newInQpin(user: string, mobile: string, amount: number, transactionId: string): Promise<any> {
    return this.simcardModel.create({
      user: user,
      mobile: mobile,
      amount: amount,
      transactionId: transactionId,
    });
  }

  async updateRes(user: string, transactionId: string, res: string): Promise<any> {
    return this.simcardModel.findOneAndUpdate(
      { user: user, transactionId: transactionId },
      {
        res: res,
      }
    );
  }

  async getChargeHistory(userid: string): Promise<any> {
    const today = getTodayStartDayUtc();
    return this.simcardModel
      .find({
        $and: [
          { user: userid },
          {
            createdAt: { $gte: today },
          },
        ],
      })
      .count();
  }

  async report(from: number, to: number): Promise<any> {
    return this.simcardModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Number(from)),
            $lte: new Date(Number(to)),
          },
        },
      },
      {
        $group: {
          _id: null,
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);
  }
}
