import { Inject, Injectable, successOpt } from '@vision/common';
import { CardService } from '../../../Core/useraccount/card/card.service';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { OrganizationNewChargeCoreService } from '../../../Core/organization/new-charge/charge.service';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { CardChargeHistoryCoreService } from '../../../Core/useraccount/card/services/card-history.service';
import { CardChargeHistoryTypeConst } from '../../../Core/useraccount/card/const/card-charge-type.const';
import { OrganizationPoolCoreCommonService } from '../../organization/pool/services/common.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { CardsStarters } from '@vision/common/enums/cards-starters';

@Injectable()
export class GroupCoreOrganizationService {
  constructor(
    private readonly cardService: CardService,
    private readonly orgChargeService: OrganizationNewChargeCoreService,
    private readonly userService: UserService,
    private readonly cardHistoryService: CardChargeHistoryCoreService,
    private readonly accountService: AccountService,
    private readonly poolService: OrganizationPoolCoreCommonService,
    @Inject('GroupUserModel') private readonly groupUserModel: any
  ) {}

  async chargeCard(getInfo: any, userid): Promise<any> {
    const info = await this.checkUser(getInfo.users);
    const uInfo = await this.userService.getInfoByUserid(userid);

    for (const item of info.cards) {
      const cardInfo = await this.cardService.getCardInfoById(item);
      if (cardInfo) {
        const groupInfo = await this.groupUserModel.findOne({ card: cardInfo._id });
        const poolInfo = await this.poolService.getPoolInfoByGroupId(groupInfo._id);

        if (poolInfo) {
          const poolId = poolInfo._id;
          const title = 'شارژ سازمانی توسط ' + uInfo.fullname;
          const cardCharge = await this.orgChargeService.chargeCard(
            cardInfo._id,
            getInfo.amount,
            userid,
            title,
            poolId
          );

          this.cardService.active(item).then((res) => {
            console.log(res, 'res');
          });

          const cardTitle = 'شارژ سازمانی توسط ' + uInfo.fullname;
          this.cardHistoryService
            .addNew(
              userid,
              item,
              getInfo.amount,
              cardTitle,
              CardChargeHistoryTypeConst.OrganiationCharge,
              cardInfo.cardno
            )
            .then((res) => console.log(res, 'ressss'));
        }
      }
    }

    for (const item of info.users) {
      // const cardInfo = await this.cardService.getCardInfoById(item);
      const cardInfo = await this.cardService.getCardByUserID(item);
      const userInfo = await this.userService.getInfoByUserid(cardInfo.user);
      const groupInfo = await this.groupUserModel.findOne({ user: userInfo._id });
      const poolInfo = await this.poolService.getPoolInfoByGroupId(groupInfo.group);
      // const cardInfo = yield this.cardService.getCardInfoById(item);
      // const poolInfo = yield this.poolService.getPoolInfoByGroupId(groupInfo._id);
      if (userInfo) {
        if (poolInfo) {
          const poolId = poolInfo._id;
          const title = 'شارژ سازمانی توسط ' + uInfo.fullname;

          const userCharge = await this.orgChargeService.chargeUser(
            userInfo._id,
            getInfo.amount,
            userid,
            title,
            poolId
          );
          await this.accountService.chargeAccount(userInfo._id, 'org', getInfo.amount);
          const userTitle = 'شارژ سازمانی توسط ' + uInfo.fullname;
          this.cardHistoryService
            .addNew(
              userid,
              item,
              getInfo.amount,
              userTitle,
              CardChargeHistoryTypeConst.OrganiationCharge,
              cardInfo.cardno
            )
            .then((res) => console.log(res, 'ressss'));
        }
      }
    }

    return successOpt();
  }

  private async checkUser(users): Promise<any> {
    const usersSplit = users.split(',');
    let cards = Array();
    let usersArray = Array();
    for (let i = 0; usersSplit.length > i; i++) {
      const res = usersSplit[i].substr(0, 6);
      if (CardsStarters.includes(res)) {
        const cardInfo = await this.getCardsId(usersSplit[i]);
        if (cardInfo.card) {
          cards.push(cardInfo.card);
        } else {
          usersArray.push(cardInfo.user);
        }
      } else {
        usersArray.push(usersSplit[i]);
      }
    }
    return {
      cards: cards,
      users: usersArray,
    };
  }

  private async getCardsId(card): Promise<any> {
    const cardInfo = await this.cardService.getCardInfo(card);
    if (!cardInfo.user) {
      return { card: cardInfo._id };
    } else {
      return { user: cardInfo.user._id };
    }
  }
}
