import {
  faildOpt,
  Injectable,
  InternalServerErrorException,
  successOpt,
  successOptWithPagination,
} from '@vision/common';
import { CardService } from '../../Core/useraccount/card/card.service';
import { AgentsSettingsService } from '../../Core/settings/service/agents-settings.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { AccountService } from '../../Core/useraccount/account/account.service';
import { notEnoughMoneyException } from '@vision/common/exceptions/notEnoughMoney.exception';
import { CardOptEnum, CardTypeEnum } from '@vision/common/enums/card-opt.enum';
import { ClubSettingsCoreService } from '../../Core/settings/service/club-settings.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { GroupCoreService } from '../../Core/group/group.service';
import { ChargeCardsDto } from './dto/charge-cards.dto';
import { ClubCoreService } from '../../Core/customerclub/club.service';
import { UserService } from '../../Core/useraccount/user/user.service';
import { GeneralService } from '../../Core/service/general.service';
import { MerchantCoreTerminalBalanceService } from '../../Core/merchant/services/merchant-terminal-balance.service';

@Injectable()
export class UsercardService {
  constructor(
    private readonly groupService: GroupCoreService,
    private readonly cardService: CardService,
    private readonly settingsService: AgentsSettingsService,
    private readonly accountService: AccountService,
    private readonly clubSettingsService: ClubSettingsCoreService,
    private readonly clubService: ClubCoreService,
    private readonly userService: UserService,
    private readonly generalService: GeneralService,
    private readonly merchantCoreService: MerchantCoreTerminalBalanceService
  ) {}

  async generateSecpin(refid: string, users: string, role: string): Promise<any> {
    const usersArray = users.split(',');
    if (role == 'customerclub') {
      return this.clubGenSecpin(usersArray, refid, role);
    } else {
      return this.generateAgentSecpin(usersArray, refid, role);
    }
  }

  async getSettings(refid, role): Promise<any> {
    let agentData;
    if (role == 'customerclub') {
      const clubData = await this.clubService.getClubInfo(refid);
      agentData = await this.settingsService.getSettings(clubData.ref);
    } else {
      agentData = await this.settingsService.getSettings(refid);
    }
    if (!agentData) throw new UserCustomException('متاسفانه برای شما تنظیماتی پیدا نشد با پشتیبانی تماس بگیرید');
    return agentData;
  }

  async generateAgentSecpin(usersArray, refid, role): Promise<any> {
    const agentData = await this.getSettings(refid, role);

    let success = false;
    for (let i = 0; usersArray.length > i; i++) {
      success = false;
      const wallet = await this.accountService.getBalance(refid, 'wallet');
      if (wallet.balance < agentData.cardprice) throw new notEnoughMoneyException();
      const gen = await this.cardService.genSecPin(usersArray[i]);
      const decharge = await this.accountService.dechargeAccount(refid, 'wallet', agentData.cardprice);
      if (!decharge) throw new UserCustomException('شما نمی توانید پین امنیتی جدید تنظیم کنید', false, 500);
      this.cardService.setLog(
        usersArray[i],
        CardTypeEnum.Secpin,
        CardOptEnum.GenerateSecpin,
        agentData.cardprice,
        gen.secpin,
        refid
      );
      this.accountService.accountSetLogg('ساخت پین امنیتی کارت', 'Secpin', agentData.cardprice, true, refid, null);
      success = true;
    }
    if (success) return successOpt();
    return faildOpt();
  }

  private async clubGenSecpin(usersArray, refid, role): Promise<any> {
    let success = false;

    const clubInfo = await this.clubService.getUserClubs(refid);
    console.log(clubInfo, 'clubInfo');
    if (clubInfo.userinfo.max > 0) {
      for (let i = 0; usersArray.length > i; i++) {
        success = false;
        this.decreaseUser(refid);
        const gen = await this.cardService.genSecPin(usersArray[i]);
        this.cardService.setLog(usersArray[i], CardTypeEnum.Secpin, CardOptEnum.GenerateSecpin, 0, gen.secpin, refid);
        this.accountService.accountSetLogg('ساخت پین امنیتی کارت', 'Secpin', 0, true, refid, null);

        success = true;
      }
      if (success) return successOpt();
      return faildOpt();
    }
    return this.generateAgentSecpin(usersArray, refid, role);
  }

  async generateGiftCard(qty, userid, group): Promise<any> {
    if (isEmpty(qty) || qty < 1) throw new FillFieldsException();
    const getClubData = await this.clubSettingsService.getPrice();
    if (!getClubData) throw new InternalServerErrorException();
    const total = getClubData.pergiftcard * qty;
    const wallet = await this.accountService.getBalance(userid, 'wallet');
    if (wallet.balance < total) throw new notEnoughMoneyException();
    this.accountService.dechargeAccount(userid, 'wallet', total);
    const title = 'هزینه ساخت کارت بی نام به تعداد ' + qty;
    this.accountService.accountSetLogg(title, 'GiftCard', total, true, userid, null);
    for (let i = 0; i < qty; i++) {
      console.log(i, 'i');
      await this.cardService.genGiftCard(userid, group).then((datax) => {
        this.groupService.addCardToGroup(datax[0]._id, group);
      });
    }
    return successOpt();
  }

  async getGiftCardList(userid, groupid, page): Promise<any> {
    if (isEmpty(groupid)) {
      const data = await this.cardService.getGiftCardList(userid, page);
      return successOptWithPagination(data);
    }
    const data = await this.cardService.getGiftCardListWithGroup(userid, page, groupid);
    return successOptWithPagination(data);
  }

  async chargeCard(getInfo: ChargeCardsDto, userid): Promise<any> {
    if (isEmpty(getInfo.amount) || isEmpty(getInfo.cards)) throw new FillFieldsException();
    return successOpt();
  }

  async decreaseUser(ownerid): Promise<any> {
    const res = await this.clubService.decreaseUser(ownerid);
    if (!res) throw new InternalServerErrorException();
    return res;
  }

  async changeCardPW(groupid): Promise<any> {
    return this.cardService.getAllByGroupAndChangePw(groupid);
  }

  async updateCard(): Promise<any> {
    const data = await this.cardService.getAll();
    for (let i = 0; data.length > i; i++) {
      let status = false;
      const res = await this.generalService.registerCardInAsanPardakht(data[i].cardno);
      if (res.errorCode == 0 || res.errorCode == 149) status = true;
      this.cardService.regitredAP(data[i]._id, status, JSON.stringify(res));
    }
  }

  async makeCard(userid): Promise<any> {
    this.cardService.generateCard(userid).then((res) => {
      console.log(res);
    });
  }

  // async getEram(): Promise<any> {
  //   let cardsArray = Array();
  //   const cards = await this.cardService.getCardsGroup('5c8cc39237fb2e1597345537');
  //   for (let i = 0; cards.length > i; i++) {
  //     const balance = await this.merchantCoreService.getBalanceWithCard(cards[i]._id);
  //     if (!balance) {
  //       cardsArray.push(cards[i]);
  //       this.setEram(cards[i]._id);
  //     }
  //   }
  //   return cardsArray;
  // }

  // async setEram(cardid): Promise<any> {
  //   const test = {
  //     terminal: [
  //       '5c90969522760d3313b51204',
  //       '5c909725adcc3b32cc13404b',
  //       "5c9097b2c32c8e32da96c61c",
  //       "5c909810a63ab8326a9cd4f6",
  //       "5c90988891d860327b7b5419",
  //       "5c9098d8ccae45332e11ad3a",
  //       "5c909923a63ab8326a9cd4f8",
  //       "5c9099783dd60032abf2cf12",
  //       "5c9099f149234132e664a859",
  //       "5c909a4c9372ff334466c5e3",
  //       "5c909aa087d08c3295a03939",
  //       "5c909af5bb281d33198b1d6e",
  //       "5c909b5887d08c3295a0393b"
  //     ],
  //     "daysofweek": [
  //       6,
  //       0,
  //       1,
  //       2,
  //       3,
  //       4,
  //       5
  //     ],
  //     "card": cardid,
  //     "amount": 1000000,
  //     "expire": new Date("2020-03-20T00:00:00.000+03:30"),
  //     "__v": 0
  //   }
  //   return this.merchantCoreService.ccCard(test);
  // }
}
