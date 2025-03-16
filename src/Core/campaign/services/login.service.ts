import { Inject, Injectable } from "@vision/common";
import { UserCustomException } from "@vision/common/exceptions/userCustom.exception";
import { MerchantCoreTerminalBalanceService } from "../../merchant/services/merchant-terminal-balance.service";
import { MerchantCoreTerminalService } from "../../merchant/services/merchant-terminal.service";
import { TurnoverBalanceCoreService } from "../../turnover/services/balance.service";
import { AccountService } from "../../useraccount/account/account.service";
import { CardService } from "../../useraccount/card/card.service";
import { CardChargeHistoryTypeConst } from "../../useraccount/card/const/card-charge-type.const";
import { CardChargeHistoryCoreService } from "../../useraccount/card/services/card-history.service";
import { CampaignChargePrefix } from "../const/type.const";
import * as moment from 'jalali-moment';
import { Types } from "mongoose";

@Injectable()
export class CampaignCoreLoginService {

  constructor(
    @Inject('LoginHistoryModel') private readonly loginModel: any,
    private readonly accountService: AccountService,
    private readonly balanceInStoreService: MerchantCoreTerminalBalanceService,
    private readonly turnOverService: TurnoverBalanceCoreService,
    private readonly cardHistoryService: CardChargeHistoryCoreService,
    private readonly cardService: CardService,
    private readonly terminalService: MerchantCoreTerminalService
  ) { }

  async chargeBis(start: any, end: any, terminals: any, title: string, amount, expire, type): Promise<any> {
    const data = await this.getLoggedInUsers(start, end);
    if (!data) throw new UserCustomException('کاربر یافت نشد');

    const terminal = await this.terminalService.getInfoByID(terminals[0]);


    for (const user of data.users) {
      const ref = CampaignChargePrefix[type] + '-' + new Date().getTime();
      const title = 'شارژ اعتبار در فروشگاه ' + terminal?.merchant?.title + ' قابل استفاده تا ' + moment(expire).locale('fa').format('YYYY/MM/DD');
      console.log(ref, 'ref')
      this.balanceInStoreService.chargeBalanceInStore(terminals, user, amount, expire, null);
      this.accountService.chargeAccount(user, 'discount', amount);
      this.accountService.accountSetLoggWithRef(title, ref, amount, true, null, user);
      const card = await this.cardService.getCardByUserID(user);
      this.turnOverService.ChargeUser('discount', terminals, user, amount, ref, title);

      if (card) {
        this.cardHistoryService
          .addNew(null, user, amount, title, CardChargeHistoryTypeConst.AgentBalanceCharge, card.cardno)
          .then((res) => console.log(res, 'ressss'));
      }
    }
  }

  async dechargeBis(): Promise<any> {

  }

  async getLoggedInUsers(start: any, end: any): Promise<any> {
    const data = await this.loginModel.aggregate([
      { $match: { createdAt: { $gte: new Date(start), $lt: new Date(end) } } },
      { $group: { _id: '$user' } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      }, {
        $unwind: {
          path: '$userInfo',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          mobiles: { $push: '$userInfo.mobile' },
          users: { $push: '$userInfo._id' }
        }
      }
    ]);

    if (data.length > 0) return data[0];

    return null;
  }


}