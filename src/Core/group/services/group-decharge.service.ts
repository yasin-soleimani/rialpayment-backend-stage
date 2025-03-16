import { Inject, Injectable } from '@vision/common';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { CardService } from '../../../Core/useraccount/card/card.service';
import { CardChargeHistoryCoreService } from '../../../Core/useraccount/card/services/card-history.service';
import { CardChargeHistoryTypeConst } from '../../../Core/useraccount/card/const/card-charge-type.const';

@Injectable()
export class GroupCoreDechargeService {
  constructor(
    @Inject('GroupModel') private readonly groupModel: any,
    @Inject('GroupUserModel') private readonly groupUserModel: any,
    @Inject('GroupChargeHistoryModel') private readonly groupChargeHistory: any,
    private readonly accountService: AccountService,
    private readonly cardService: CardService,
    private readonly userService: UserService,
    private readonly cardHistoryService: CardChargeHistoryCoreService
  ) {}

  async dechargeGroupUsers(gid: string, amount: number, userid: string): Promise<any> {
    const groupUsers = await this.groupUserModel.find({ group: gid });
    let counter = 1;
    for (const info of groupUsers) {
      const userInfo = await this.userService.getInfoByUserid(info.user);
      if (userInfo) {
        const wallet = await this.accountService.getWallet(userInfo._id);
        if (wallet.balance >= amount) {
          this.accountService.dechargeAccount(userInfo._id, 'wallet', amount);
          const cardInfo = await this.cardService.getCardByUserID(userInfo._id);
          const cardTitle = 'کسر شارژ توسط مدیریت باشگاه';
          this.cardHistoryService
            .addNew(
              userid,
              userInfo._id,
              amount,
              cardTitle,
              CardChargeHistoryTypeConst.AgentCashCharge,
              cardInfo.cardno
            )
            .then((res) => console.log(res, 'ressss'));
          counter++;
        }
      }
    }

    console.log(counter, 'group decharge counter');
  }
}
