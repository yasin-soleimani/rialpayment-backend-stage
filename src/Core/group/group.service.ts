import {
  Injectable,
  Inject,
  successOpt,
  InternalServerErrorException,
  successOptWithDataNoValidation,
  successOptWithPagination,
  NotFoundException,
} from '@vision/common';
import { Types } from 'mongoose';
import { GroupCoreDto } from './dto/group-core.dto';
import { MerchantCoreTerminalBalanceService } from '../merchant/services/merchant-terminal-balance.service';
import { todayNum } from '@vision/common/utils/month-diff.util';
import { CardService } from '../useraccount/card/card.service';
import { UserService } from '../useraccount/user/user.service';
import { AccountService } from '../useraccount/account/account.service';
import { notEnoughMoneyException } from '@vision/common/exceptions/notEnoughMoney.exception';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { CardChargeHistoryCoreService } from '../useraccount/card/services/card-history.service';
import { CardChargeHistoryTypeConst } from '../useraccount/card/const/card-charge-type.const';
import { GroupCoreOrganizationService } from './services/group-organization.service';
import { TurnoverBalanceCoreService } from '../turnover/services/balance.service';
import { GroupAggregateFilter } from './function/filter.func';
import { ClubSettingsCoreService } from '../settings/service/club-settings.service';
import { TicketsCoreService } from '../tickets/tickets.service';
import { CardsStarters } from '@vision/common/enums/cards-starters';

@Injectable()
export class GroupCoreService {
  constructor(
    @Inject('GroupModel') private readonly groupModel: any,
    @Inject('GroupUserModel') private readonly groupUserModel: any,
    @Inject('GroupChargeHistoryModel') private readonly groupChargeHistory: any,
    private readonly accountService: AccountService,
    private readonly cardService: CardService,
    private readonly cardHistoryService: CardChargeHistoryCoreService,
    private readonly userService: UserService,
    private readonly balanceInStoreService: MerchantCoreTerminalBalanceService,
    private readonly orgChargeService: GroupCoreOrganizationService,
    private readonly turnOverService: TurnoverBalanceCoreService,
    private readonly clubSettingsCoreService: ClubSettingsCoreService,
    private readonly ticketsCoreService: TicketsCoreService
  ) {}

  // add new Group in db
  async newGroup(getInfo: GroupCoreDto): Promise<any> {
    return this.groupModel.create(getInfo);
  }

  async getInfo(gid: string, userid: string): Promise<any> {
    return this.groupModel.findOne({
      _id: gid,
      user: userid,
    });
  }

  async newOrganizationCharge(getInfo: any, userid): Promise<any> {
    return this.orgChargeService.chargeCard(getInfo, userid);
  }

  async getAllUsersGroup(gid: string, userid: string): Promise<any> {
    const groupInfo = await this.groupModel.findOne({
      _id: gid,
      user: userid,
    });
    if (!groupInfo) throw new UserCustomException('شما دسترسی به این گروه را ندارید');
    const data = await this.groupUserModel
      .find({
        group: gid,
      })
      .populate('user');

    let tempArray = Array();

    for (const info of data) {
      if (info.user) {
        tempArray.push({
          _id: info.user._id,
          fullname: info.user.fullname || 'بی نام',
        });
      }
    }

    return tempArray;
  }

  // edit group
  async editGroup(gid: string, userid: string, title: string, description: string): Promise<any> {
    return this.groupModel.findOneAndUpdate({ _id: gid, user: userid }, { title, description });
  }

  // change group status
  async changeGroupStatus(gid: string, userid: string, status: boolean): Promise<any> {
    return this.groupModel.findOneAndUpdate({ _id: gid, user: userid }, { status });
  }

  // get List Groups with Pagination
  async getGroupList(userid: string, page): Promise<any> {
    const ObjID = Types.ObjectId;
    const aggregate = this.groupModel.aggregate();
    aggregate.match({
      $or: [{ user: ObjID(userid) }, { user: 'all' }],
    });
    aggregate.sort({
      _id: -1,
    });
    const options = { page, limit: 50 };

    return this.groupModel.aggregatePaginate(aggregate, options);
    // return this.groupModel.paginate({ user: userid } , { page , sort : { createdAt : -1 }, select: { __v: 0, createdAt: 0, updatedAt: 0} , limit : 10 });
  }

  async getGroupAll(userid: string): Promise<any> {
    return this.groupModel.find({
      user: userid,
    });
  }
  async getGroupNames(userid: string): Promise<any> {
    return this.groupModel
      .find({
        user: userid,
      })
      .select({ title: 1 });
  }
  async getChargedLists(userid, groupid: string, page?): Promise<any> {
    const ObjID = Types.ObjectId;
    const aggregate = this.groupChargeHistory.aggregate();
    aggregate.lookup({
      from: 'merchantterminals',
      localField: 'terminals',
      foreignField: '_id',
      as: 'terminal',
    });
    aggregate.lookup({
      from: 'merchants',
      localField: 'terminal.merchant',
      foreignField: '_id',
      as: 'merchantz',
    });
    aggregate.lookup({
      from: 'settingsagents',
      localField: 'user',
      foreignField: 'user',
      as: 'settings',
    });
    aggregate.match({
      $or: [{ 'merchantz.ref': ObjID(userid) }, { 'merchantz.user': ObjID(userid) }],
    });
    aggregate.project({
      expire: 1,
      'terminal.title': 1,
      'terminal._id': 1,
      amount: 1,
      'terminal.terminalid': 1,
      settings: 1,
    });
    const options = { page: 1, limit: 50 };

    return this.groupChargeHistory.aggregatePaginate(aggregate, options);
  }

  // GroupUser
  async addUserToGroup(userid, groupid): Promise<any> {
    return this.groupUserModel.findOneAndUpdate(
      { user: userid },
      { $set: { group: groupid } },
      { new: true, upsert: true }
    );
  }

  async addCardToGroup(cardid, groupid): Promise<any> {
    return this.groupUserModel.findOneAndUpdate(
      { card: cardid },
      { group: groupid, card: cardid },
      { new: true, upsert: true }
    );
  }

  // delete Group
  async deleteGroup(userid, gid): Promise<any> {
    return this.groupModel.findOneAndRemove({ _id: gid, user: userid }).then((item) => {
      this.groupUserModel.deleteMany({ group: gid });
      return item;
    });
  }

  async getAll(userid): Promise<any> {
    return this.groupModel.find({ user: userid }).select({ __v: 0, createdAt: 0, updatedAt: 0, user: 0 });
  }

  async findUsers(groupid): Promise<any> {
    console.log(groupid);
    return this.groupUserModel.find({ group: groupid });
  }

  async getUserGroup(input: string, terminalid: string): Promise<any> {
    const today = todayNum(new Date());
    let ObjID = Types.ObjectId;
    let aggregate = this.groupUserModel.aggregate();
    aggregate.lookup({
      from: 'merchantstrategies',
      localField: 'group',
      foreignField: 'group',
      as: 'strategies',
    });
    aggregate.lookup({
      from: 'merchantterminals',
      localField: 'strategies.terminal',
      foreignField: '_id',
      as: 'terms',
    });

    aggregate.match({
      $and: [
        { user: ObjID(input) },
        { 'strategies.daysofweek': { $in: [today] } },
        { 'strategies.terminal': ObjID(terminalid) },
        { 'strategies.group': { $exists: true } },
      ],
    });

    return aggregate;

    // return this.groupUserModel.findOne({ user: input }).populate({
    //   path: 'strategy',
    //   match: { 'daysofweek': {$in : [today]}},
    //   populate: {
    //     'path': 'terminal',
    //   }
    // }).populate('group');
  }

  async getUserListAll(userid: string, page: number, groupid: string): Promise<any> {
    const ObjID = Types.ObjectId;
    const aggregate = this.groupUserModel.aggregate();
    aggregate.lookup({
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'users',
    });
    aggregate.lookup({
      from: 'cards',
      localField: 'user',
      foreignField: 'user',
      as: 'cardinfo',
    });
    aggregate.lookup({
      from: 'cards',
      localField: 'card',
      foreignField: '_id',
      as: 'noname',
    });
    aggregate.match({
      group: ObjID(groupid),
    });
    aggregate.addFields({
      _id: { $arrayElemAt: ['$users._id', 0] },
      fullname: { $arrayElemAt: ['$users.fullname', 0] },
      mobile: { $arrayElemAt: ['$users.mobile', 0] },
      birthdate: { $arrayElemAt: ['$users.birthdate', 0] },
      cardno: { $arrayElemAt: ['$cardinfo.cardno', 0] },
      secpin: { $arrayElemAt: ['$cardinfo.secpin', 0] },
      amount: { $arrayElemAt: ['$cardinfo.amount', 0] },
      cvv2: { $arrayElemAt: ['$cardinfo.cvv2', 0] },
      noname: { $arrayElemAt: ['$noname', 0] },
    });
    aggregate.project({
      _id: 1,
      fullname: 1,
      mobile: 1,
      birthdate: 1,
      cardno: 1,
      secpin: 1,
      cvv2: 1,
      noname: 1,
      amount: 1,
    });

    const options = { page, limit: 50 };

    return this.groupUserModel.aggregatePaginate(aggregate, options);
  }

  async getUserSearchListAll(userid: string, page: number, groupid: string, search: string): Promise<any> {
    const mobile = search.substr(0, 1);
    let searchMobile;
    if (mobile == '0') {
      searchMobile = search.substr(1, search.length);
    } else {
      searchMobile = search;
    }

    const noname = await this.groupUserModel.count({ group: groupid, card: { $exists: true } });
    const userCount = await this.groupUserModel.count({ group: groupid, user: { $exists: true } });

    const query = GroupAggregateFilter(noname, userCount, search, searchMobile, groupid);
    console.log(query, 'aggregate query');
    const aggregate = this.groupUserModel.aggregate(query);
    const options = { page, limit: 50 };

    return this.groupUserModel.aggregatePaginate(aggregate, options);
  }

  async getAllForExport(userid: string, groupid: string): Promise<any> {
    const ObjID = Types.ObjectId;
    const aggregate = this.groupUserModel.aggregate();

    aggregate.lookup({
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'users',
    });
    aggregate.lookup({
      from: 'cards',
      localField: 'user',
      foreignField: 'user',
      as: 'cardinfo',
    });
    aggregate.lookup({
      from: 'cards',
      localField: 'card',
      foreignField: '_id',
      as: 'noname',
    });
    aggregate.match({
      group: ObjID(groupid),
    });

    aggregate.addFields({
      _id: { $arrayElemAt: ['$users._id', 0] },
      fullname: { $arrayElemAt: ['$users.fullname', 0] },
      mobile: { $arrayElemAt: ['$users.mobile', 0] },
      birthdate: { $arrayElemAt: ['$users.birthdate', 0] },
      cardno: { $arrayElemAt: ['$cardinfo.cardno', 0] },
      secpin: { $arrayElemAt: ['$cardinfo.secpin', 0] },
      amount: { $arrayElemAt: ['$cardinfo.amount', 0] },
      noname: { $arrayElemAt: ['$noname', 0] },
    });
    aggregate.project({
      _id: 1,
      fullname: 1,
      mobile: 1,
      birthdate: 1,
      cardno: 1,
      secpin: 1,
      noname: 1,
      amount: 1,
    });

    return aggregate;
  }

  async getUsers(groupid): Promise<any> {
    return this.groupUserModel.find({ group: groupid });
  }

  async getUsersPopUsers(groupid): Promise<any> {
    return this.groupUserModel.find({ group: groupid }).populate('user').populate('group');
  }

  async createChargeHistory(groupid, terminals, amount, expire, daysofweek): Promise<any> {
    return this.groupChargeHistory.create({
      group: groupid,
      terminals,
      amount,
      expire,
      daysofweek,
    });
  }

  async getTicketsChargeHistoryAll(
    cards: number[],
    page: number,
    type: number,
    start: number,
    end: number,
    userid: string
  ) {
    const history = await this.ticketsCoreService.getTicketHistoryChargesByCardNoAll(cards, start, end, page, true);
    console.log(history);
    const array = [];
    for (const item of history.docs) {
      array.push({
        ...item, //@ts-ignore
        user: item?.user?.fullname,
      });
    }
    return successOptWithPagination({ ...history, docs: array });
  }

  async getGroupTicketsChargeHistoryAllExcel(cards: number[], type: number, start: number, end: number, user, groupId) {
    const history = await this.ticketsCoreService.getTicketHistoryChargesByCardNoAll(cards, start, end, 1);
    const groupTitle = await this.getInfoById(groupId)
    console.log("group name:::", groupTitle.title)
    const exl = await this.ticketsCoreService.makeExcel(history, user, groupId, groupTitle.title);
    return exl;
  }

  async getUserTicketHistory(cardno, page) {
    const history = await this.ticketsCoreService.getTicketHistoryByCardNo(cardno, page);
    return successOptWithPagination(history);
  }

  async getUserTicketCharge(card_id, page) {
    const cardInfo = await this.cardService.getCardInfo(card_id);
    if (!cardInfo) throw new NotFoundException();
    const history = await this.ticketsCoreService.getTicketChargesByCardId(cardInfo._id, page);
    return successOptWithPagination(history);
  }

  async chargeGroupTickets(
    terminalStr: string,
    groupid: string,
    count: number,
    expire: number,
    daysofweek = [6, 0, 1, 2, 3, 4, 5],
    users: string,
    userid: string,
    title: string,
    canUseMulti: boolean | Boolean
  ) {
    const terminals = terminalStr.split(',');
    const info = await this.checkUsers(users);
    const total = info.cards.length + info.users.length;
    const { ticketsWage } = await this.clubSettingsCoreService.getPrice();
    const wage = total * count * ticketsWage;
    const walletBalance = await this.accountService.getBalance(userid, 'wallet');
    const allCards = [...info.cards, ...info.users];
    if (wage > walletBalance.balance) {
      throw new UserCustomException('موجودی حساب کاربری کافی نمیباشد');
    }
    if (!title || title.length < 1) throw new UserCustomException('عنوان را وارد نمایید');
    if (expire < new Date().getTime()) throw new UserCustomException('تاریخ انقضا صحیح نمیباشد');
    const resultAccount = await this.accountService
      .dechargeAccount(userid, 'wallet', wage)
      .then((res) => {
        return this.accountService.accountSetLogg(
          `کارمزد شارژ تیکت (${total} نفر) جمعا (${total * count} تیکت) `,
          'Wage',
          wage,
          true,
          userid,
          null
        );
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
    if (!resultAccount) throw new InternalServerErrorException();

    const expireDate = new Date(expire).toISOString();

    for (const ingroup of allCards) {
      const cardInfo = await this.cardService.getCardInfoById(ingroup);
      let cardTitle = title + ' - ' + cardInfo.cardno;
      if (!title || title.length < 1) cardTitle = 'شارژ ' + count + ' عدد تیکت' + ' - ' + cardInfo.cardno;
      const dataInsert = await this.ticketsCoreService.createOne({
        card: ingroup,
        daysofweek,
        terminals,
        title: cardTitle,
        totalCount: count,
        remainCount: count,
        expire: expireDate,
        group: groupid,
        user: cardInfo.user ?? null,
        canUseMultiTime: canUseMulti as boolean,
      });
    }
    return successOpt();
  }

  async chargeGroupUsers(terminals: string[], groupid, amount, expire, daysofweek, users, userid, title): Promise<any> {
    const info = await this.checkUsers(users);
    const total = info.cards.length + info.users.length;
    const walletBalance = await this.accountService.getBalance(userid, 'wallet');
    const bankx = Math.round((0.5 * amount) / 100);
    const totalAmount = bankx * total;
    const successList = [];
    const errorList = [];
    if (totalAmount > walletBalance.balance) {
      throw new UserCustomException('موجودی حساب کاربری کافی نمیباشد');
    }
    const resultAccount = await this.accountService
      .dechargeAccount(userid, 'wallet', totalAmount)
      .then((res) => {
        return this.accountService.accountSetLogg(
          'کارمزد شارژ کارت اعتبار در فروشگاه',
          'Wage',
          totalAmount,
          true,
          userid,
          null
        );
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });

    if (!resultAccount) throw new InternalServerErrorException();
    if (!title || title.length < 1) throw new UserCustomException('عنوان را وارد نمایید');
    if (info.cards.length > 0) {
      for (const ingroup of info.cards) {
        const cardInfo = await this.cardService.getCardInfoById(ingroup);
        let cardTitle = title + ' - ' + cardInfo.cardno;
        if (!title || title.length < 1) cardTitle = 'شارژ اعتبار در فروشگاه' + ' - ' + cardInfo.cardno;

        this.balanceInStoreService
          .chargeBalanceinStoreWithCard(terminals, cardInfo._id, amount, expire, daysofweek)
          .then(() => successList.push({ card: cardInfo._id, amount }));
        this.turnOverService.chargeCard('discount', terminals, cardInfo._id, amount, resultAccount.ref, cardTitle);

        this.cardHistoryService
          .addNew(userid, ingroup, amount, cardTitle, CardChargeHistoryTypeConst.AgentBalanceCharge, cardInfo.cardno)
          .then((res) => console.log(res, 'ressss'));
      }
    }
    if (info.users.length > 0) {
      for (const ingroup of info.users) {
        const cardInfo = await this.cardService.getCardInfoById(ingroup);
        console.log("in group:::", ingroup)
        console.log("card info:::", cardInfo)

        let cardTitle = title + ' - ' + cardInfo.cardno;
        if (!title || title.length < 1) cardTitle = 'شارژ اعتبار در فروشگاه' + ' - ' + cardInfo.cardno;
        this.balanceInStoreService.chargeBalanceInStore(terminals, cardInfo.user, amount, expire, daysofweek);

        this.accountService.chargeAccount(cardInfo.user, 'discount', amount).then((res) => {
          successList.push({ card: cardInfo._id, amount });
          console.log(res, 'discount charge res');
        });
        const resAccount = await this.accountService.accountSetLogg(
          cardTitle,
          'ChargeBIS-',
          amount,
          true,
          userid,
          cardInfo.user
        );
        this.turnOverService.ChargeUser('discount', terminals, cardInfo.user, amount, resAccount.ref, cardTitle);
        this.cardHistoryService
          .addNew(
            userid,
            cardInfo._id,
            amount,
            cardTitle,
            CardChargeHistoryTypeConst.AgentBalanceCharge,
            cardInfo.cardno
          )
          .then((res) => console.log(res, 'ressss'));
      }
    }

    this.createChargeHistory(groupid, terminals, amount, expire, daysofweek);
    return successOptWithDataNoValidation({ success: successList, count: successList.length });
  }

  async chargeAmountInGroupUsers(amount, users, userid): Promise<any> {
    const info = await this.checkUsers(users);
    if (info.cards.length > 0) {
      for (const userCharge of info.cards) {
        const wallet = await this.accountService.getBalance(userid, 'wallet');
        if (wallet.balance < amount) throw new notEnoughMoneyException();
        if (wallet.balance > Number(amount)) {
          const cardInfo = await this.cardService.getCardInfoById(userCharge);
          if (cardInfo) {
            const title = 'هزینه شارژ کارت' + ' ' + cardInfo.cardno;
            this.accountService.dechargeAccount(userid, 'wallet', amount);
            this.accountService.accountSetLogg(title, 'ChargeCard', amount, true, userid, null);
            this.cardService.active(userCharge).then((res) => {
              console.log(res, 'res');
            });
            this.cardService.chargeCard(userCharge, amount);
            const cardTitle = 'شارژ کیف پول';
            this.cardHistoryService
              .addNew(
                userid,
                userCharge,
                amount,
                cardTitle,
                CardChargeHistoryTypeConst.AgentCashCharge,
                cardInfo.cardno
              )
              .then((res) => console.log(res, 'ressss'));
          }
        }
      }
    }

    if (info.users.length > 0) {
      for (const userCharge of info.users) {
        const wallet = await this.accountService.getBalance(userid, 'wallet');
        if (wallet.balance < amount) throw new notEnoughMoneyException();
        if (wallet.balance > amount) {
          const cardInfos = await this.cardService.getCardInfoById(userCharge);
          const userInfo = await this.userService.getInfoByUserid(cardInfos.user);
          if (userInfo) {
            const title = 'هزینه شارژ (کارت - کیف پول) ' + cardInfos.cardno;
            await this.accountService.dechargeAccount(userid, 'wallet', amount);
            this.accountService.accountSetLogg(title, 'ChargeCard', amount, true, userid, userInfo._id);
            this.accountService.chargeAccount(userInfo._id, 'wallet', amount);

            const cardInfo = await this.cardService.getCardByUserID(userInfo._id);
            const cardTitle = 'شارژ کیف پول';
            this.cardHistoryService.addNew(
              userid,
              cardInfo._id,
              amount,
              cardTitle,
              CardChargeHistoryTypeConst.AgentCashCharge,
              cardInfo.cardno
            );
          }
        }
      }
    }
    return successOpt();
  }

  async chargePayWallet(amount, userid, info, cardno): Promise<any> {
    for (const cardCHarge of info.card) {
      const wallet = await this.accountService.getBalance(userid, 'wallet');
      if (wallet.balance < amount) break;
      const title = 'هزینه شارژ کارت' + cardCHarge;
      this.accountService.dechargeAccount(userid, 'wallet', amount);
      this.accountService.accountSetLogg(title, 'ChargeCard', amount, true, userid, null);
      this.cardService.active(cardCHarge).then((res) => {
        console.log(res, 'res');
      });
      this.cardService.chargeCard(cardCHarge, amount);
    }

    for (const userCharge of info.user) {
      const wallet = await this.accountService.getBalance(userid, 'wallet');
      if (wallet.balance < amount) break;
      const title = 'هزینه شارژ (کارت - کیف پول) ' + cardno;
      this.accountService.dechargeAccount(userid, 'wallet', amount);
      this.accountService.accountSetLogg(title, 'ChargeCard', amount, true, userid, null);
      this.accountService.chargeAccount(userCharge, 'paywallet', amount);
    }
  }

  private async checkUsers(users): Promise<any> {
    const usersSplit = users.split(',');
    let cards = Array();
    let usersArray = Array();
    for (let i = 0; usersSplit.length > i; i++) {
      const res = usersSplit[i].substr(0, 6);
      if (CardsStarters.includes(res)) {
        const cardInfo = await this.getCardsId(usersSplit[i]);
        if (cardInfo.card) {
          cards.push(cardInfo.card);
          console.log("yasin result card:::", cardInfo.card)
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
    console.log("yasin req card :::", card)
    console.log("yasin card info:::", cardInfo)
    if (!cardInfo.user) {
      return { card: cardInfo._id };
    } else {
      return { user: cardInfo.user._id };
    }
  }

  async getUserGroups(userid: string): Promise<any> {
    return this.groupUserModel.find({ user: userid });
  }

  async getCardGroups(cardid): Promise<any> {
    return this.groupUserModel.find({ card: cardid });
  }

  async getGroupUsers(groupid): Promise<any> {
    return this.groupUserModel.find({ group: groupid });
  }
  async removeCardFromGroup(id: string): Promise<any> {
    return this.groupUserModel.findOneAndRemove({
      card: id,
    });
  }

  async chargeHistoryAddAllGroup(group: string, type: number, message: string, amount: number): Promise<any> {
    const data = await this.groupUserModel.find({ group }).populate('card group');
    const cardInfo = await this.cardService.getCardsGroup(group);

    for (const info of cardInfo) {
      const x = await this.groupUserModel.findOne({ card: info._id, group });
      if (!x) console.log(info, 'info card');

      // this.cardHistoryService.addNew(info.group.user, info.card._id, amount, message,type, info.card.cardno);
    }
  }

  async getInfoById(id: string): Promise<any> {
    return this.groupModel.findOne({ _id: id });
  }

  async getGroupByUserId(userid: string): Promise<any> {
    return this.groupUserModel.findOne({ user: userid }).sort({ createdAt: -1 });
  }

  async getGroupInfoByUserId(userid: string): Promise<any> {
    return this.groupUserModel.findOne({ user: userid }).populate('group').sort({ createdAt: -1 });
  }

  async getGroupByCardId(cardId: string): Promise<any> {
    return this.groupUserModel.findOne({ card: cardId }).sort({ createdAt: -1 });
  }
}
