import {
  Injectable,
  successOpt,
  faildOpt,
  successOptWithData,
  successOptWithPagination,
  successOptWithDataNoValidation,
  InternalServerErrorException,
} from '@vision/common';
import { GroupCoreService } from '../../Core/group/group.service';
import { GroupDto } from './dto/group.dto';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { UserService } from '../../Core/useraccount/user/user.service';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { imageTransform } from '@vision/common/transform/image.transform';
import { GroupChargeDto } from './dto/group-charge.dto';
import { timestamoToISO } from '@vision/common/utils/month-diff.util';
import { AgentsSettingsService } from '../../Core/settings/service/agents-settings.service';
import { ClubSettingsCoreService } from '../../Core/settings/service/club-settings.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { OrganizationGroupStrategyDto } from './dto/group-organization.dto';
import { MerchantCoreTerminalBalanceService } from '../../Core/merchant/services/merchant-terminal-balance.service';
import { SendtoallDto } from './dto/sendtoall.dto';
import { SendtoallService } from './services/sendtoall.service';
import { GroupCardInfoApiService } from './services/card-info.service';
import { CardService } from '../../Core/useraccount/card/card.service';
import { GroupListCoreService } from '../../Core/group/services/group-list.service';
import { GroupCardChargeHistoryTypeConst } from './const/group-card-charge-type.const';
import { CoreGroupTerminalBalanceService } from '../../Core/group-terminal-balance/group-tb.service';
import { CoreGroupSearch } from '../../Core/group/services/group-search.service';
import { GroupCoreUsersCardsService } from '../../Core/group/services/group-users-card.service';
import * as mongoose from 'mongoose';
import { MerchantShareService } from '../../Core/merchant/services/merchant-share.service';

@Injectable()
export class GroupService {
  constructor(
    private readonly groupCoreService: GroupCoreService,
    private readonly userService: UserService,
    private readonly settingsService: AgentsSettingsService,
    private readonly settingsAllService: ClubSettingsCoreService,
    private readonly sendToAllService: SendtoallService,
    private readonly cardInfoService: GroupCardInfoApiService,
    private readonly terminalBalanceService: MerchantCoreTerminalBalanceService,
    private readonly cardService: CardService,
    private readonly groupListService: GroupListCoreService,
    private readonly balanceService: CoreGroupTerminalBalanceService,
    private readonly searchService: CoreGroupSearch,
    private readonly groupsCardService: GroupCoreUsersCardsService,
    private readonly merchantShareService: MerchantShareService
  ) {}

  async newGroup(userid, getInfo: GroupDto): Promise<any> {
    getInfo.user = userid;
    getInfo.status = true;
    const data = await this.groupCoreService.newGroup(getInfo);
    if (data) {
      return successOpt();
    } else {
      return faildOpt();
    }
  }

  async getList(userid, page): Promise<any> {
    const data = await this.groupCoreService.getGroupList(userid, page);
    return successOptWithPagination(data);
  }

  async updateGroup(userid, getInfo: GroupDto): Promise<any> {
    const data = await this.groupCoreService.editGroup(getInfo.gid, userid, getInfo.title, getInfo.description);
    if (data) {
      return successOpt();
    } else {
      return faildOpt();
    }
  }

  async deleteGroup(userid, gid): Promise<any> {
    const data = await this.groupCoreService.deleteGroup(userid, gid);
    if (data) {
      return successOpt();
    } else {
      return faildOpt();
    }
  }

  async addUserToGroup(refid, userid, gid): Promise<any> {
    const userInfo = await this.userService.findById(userid);
    if (userInfo) {
      if (userInfo.ref == refid) {
        const data = await this.groupCoreService.addUserToGroup(userid, gid);
        if (data) {
          return successOpt();
        } else {
          return faildOpt();
        }
      } else {
        throw new UserCustomException('متاسفانه شما به این کاربر دسترسی ندارید', false, 401);
      }
    } else {
      throw new UserNotfoundException();
    }
  }

  async getAllList(userid: string): Promise<any> {
    const data = await this.groupCoreService.getAll(userid);
    if (data) {
      return successOptWithData(data);
    } else {
      return faildOpt();
    }
  }

  async getUsersSearchList(search: string, groupid: string, userid: string, page: number, type): Promise<any> {
    // const data = await this.groupCoreService.getUserSearchListAll(userid, page, groupid, search);
    if (!type || type?.length < 1) throw new InternalServerErrorException();

    const data = await this.searchService.getSearch(userid, page, groupid, search, type);
    let price;
    const settings = await this.settingsService.getSettings(userid);
    if (!settings) {
      const settings1 = await this.settingsAllService.getPrice();
      price = settings1.userreg;
    } else {
      price = settings.cardprice;
    }

    const shares = await this.merchantShareService.getSharesByToId(userid);
    const array = [mongoose.Types.ObjectId(userid)];
    for (const share of shares) array.push(mongoose.Types.ObjectId(share.shareFromUser as string));
    const terminals = await this.balanceService.getMerchantsByUserIdAll(array, true);

    let tempArray = Array();
    for (let i = 0; i < data.docs.length; i++) {
      let cardno,
        pin,
        secpin,
        type,
        mod,
        _id = '';
      let status = true;

      if (data.docs[i].noname) {
        const cardAmount = await this.balanceService.getBalanceByCard(terminals, data.docs[i].noname._id);

        _id = data.docs[i].noname._id;
        cardno = data.docs[i].noname.cardno;
        pin = data.docs[i].noname.pin;
        secpin = data.docs[i].noname.secpin;
        type = data.docs[i].noname.type;
        mod = cardAmount;
        status = status;
      } else {
        const amount = await this.balanceService.getBalanceByUser(terminals, data.docs[i]._id);

        _id = data.docs[i].cardId;
        cardno = data.docs[i].cardno;
        pin = data.docs[i].pin;
        secpin = data.docs[i].secpin;
        status = status;
        mod = amount;
        type = '100';
      }
      tempArray.push({
        _id: _id,
        mobile: data.docs[i].mobile || '',
        fullname: data.docs[i].fullname || '',
        avatar: imageTransform(data.docs[i].avatar),
        birthdate: data.docs[i].birthdate || '',
        type: parseInt(type),
        cardno: cardno,
        secpin: secpin || '',
        mod: mod,
        status: status || false,
      });
    }
    data.docs = tempArray;
    return successOptWithPagination(data, price);

    // return data;
    // let price;
    // const settings = await this.settingsService.getSettings( userid );
    // if ( !settings ) {
    //   const settings1 = await  this.settingsAllService.getPrice();
    //   price = settings1.userreg;
    // } else {
    //   price =  settings.cardprice;
    // }
    // let tempArray = Array();
    // const datax = data.docs;
    // for ( const info of datax ) {
    //   if ( info.user ) {
    //     tempArray.push({
    //       _id: info.user._id,
    //       mobile: info.user.mobile,
    //       fullname: info.user.fullname || '',
    //       avatar: imageTransform(info.user.avatar),
    //       birthdate: info.user.birthdate || '',
    //       type: 100,
    //       cardno: info.user.card.cardno,
    //       secpin: info.user.card.secpin || '',
    //       status: info.user.active || false,
    //     })
    //   }
    // }
    // data.docs = tempArray;
    // return successOptWithPagination( data, price );
  }

  async getUsersList(groupid, userid, page): Promise<any> {
    const data = await this.groupListService.getList(userid, groupid, page);
    // return data;
    // const data = await this.cardService.getCardGroupList(userid, page, groupid);
    const settings = await this.settingsService.getSettings(userid);
    let price;

    if (!settings) {
      const settings1 = await this.settingsAllService.getPrice();
      price = settings1.userreg;
    } else {
      price = settings.cardprice;
    }

    let tmpArray = Array();

    const shares = await this.merchantShareService.getSharesByToId(userid);
    const array = [mongoose.Types.ObjectId(userid)];
    for (const share of shares) array.push(mongoose.Types.ObjectId(share.shareFromUser as string));
    const terminals = await this.balanceService.getMerchantsByUserIdAll(array, true);

    for (const info of data.docs) {
      console.log('groupUserData info::::: ', info);

      if (info.user) {
        const amount = await this.balanceService.getBalanceByUser(terminals, info.user._id);
        tmpArray.push({
          _id: info.user.card._id,
          mobile: info.user.mobile,
          fullname: info.user.fullname || '',
          avatar: imageTransform(info.user.avatar),
          birthdate: info.user.birthdate || '',
          type: parseInt(info.user.card.type),
          cardno: info.user.card.cardno,
          secpin: info.user.card.secpin || '',
          status: info.user.card.status,
          cardStatus: info?.user?.card?.status,
          mod: amount,
          cvv2: info.user.card.cvv2,
        });
      } else if (info.card.user) {
        const amount = await this.balanceService.getBalanceByUser(terminals, info.card.user._id);

        tmpArray.push({
          _id: info.card._id,
          mobile: info.card.user.mobile,
          fullname: info.card.user.fullname || '',
          avatar: imageTransform(info.card.user.avatar),
          birthdate: info.card.user.birthdate || '',
          type: parseInt(info.card.type),
          cardno: info.card.user.cardno,
          secpin: info.card.user.secpin || '',
          status: info.card.user.status,
          cardStatus: info.card.status,
          mod: amount,
          cvv2: info.card.user.cvv2,
        });
      } else {
        const cardAmount = await this.balanceService.getBalanceByCard(terminals, info.card._id);
        tmpArray.push({
          _id: info.card._id,
          mobile: '',
          fullname: '',
          avatar: '',
          birthdate: '',
          type: parseInt(info.type),
          cardno: info.card.cardno,
          secpin: info.card.secpin || '',
          status: info.card.status,
          cardStatus: info.card.status,
          mod: cardAmount,
          cvv2: info.card.cvv2,
        });
      }
    }

    data.docs = tmpArray;
    return successOptWithPagination(data, price);
  }

  // async getUsersList(groupid, userid, page): Promise<any> {
  //   const data = await this.groupCoreService.getUserListAll(userid, page, groupid);
  //   let price;
  //   const settings = await this.settingsService.getSettings(userid);
  //   if (!settings) {
  //     const settings1 = await this.settingsAllService.getPrice();
  //     price = settings1.userreg;
  //   } else {
  //     price = settings.cardprice;
  //   }
  //   let tempArray = Array();
  //   for (let i = 0; i < data.docs.length; i++) {
  //     let cardno, pin, secpin, type, _id = '', amount, cvv2;
  //     let status = false;

  //     if (data.docs[i].noname) {
  //       if (data.docs[i].noname.amount > 0) {
  //         status = true;
  //       }
  //       _id = data.docs[i].noname._id;
  //       cardno = data.docs[i].noname.cardno;
  //       pin = data.docs[i].noname.pin;
  //       secpin = data.docs[i].noname.secpin;
  //       type = data.docs[i].noname.type;
  //       status = status;
  //       amount = data.docs[i].noname.amount;
  //       cvv2 = data.docs[i].noname.cvv2;
  //     } else {
  //       _id = data.docs[i]._id;
  //       cardno = data.docs[i].cardno;
  //       pin = data.docs[i].pin;
  //       secpin = data.docs[i].secpin;
  //       status = status;
  //       amount = 0;
  //       cvv2 = data.docs[i].cvv2
  //       type = '100';
  //     }
  //     tempArray.push({
  //       _id: _id,
  //       mobile: data.docs[i].mobile || '',
  //       fullname: data.docs[i].fullname || '',
  //       avatar: imageTransform(data.docs[i].avatar),
  //       birthdate: data.docs[i].birthdate || '',
  //       type: parseInt(type),
  //       cardno: cardno,
  //       secpin: secpin || '',
  //       status: status || false,
  //       mod: amount,
  //       cvv2: cvv2
  //     })
  //   }
  //   data.docs = tempArray;
  //   return successOptWithPagination(data, price);
  // }

  async chargeGroupUsers(getInfo: GroupChargeDto, users, userid): Promise<any> {
    await this.checkValues(getInfo);
    const terminalsData = getInfo.terminal.split(',');
    const expireDate = timestamoToISO(parseInt(getInfo.expire) * 1000);
    const daysofweek = await this.daysOfWeek(getInfo);
    return this.groupCoreService.chargeGroupUsers(
      terminalsData,
      getInfo.group,
      getInfo.amount,
      expireDate,
      daysofweek,
      users,
      userid,
      getInfo.title
    );
  }
  async chargeGroupTickets(getInfo, users, userid): Promise<any> {
    await this.checkValues(getInfo);
    const daysofweek = await this.daysOfWeek(getInfo);
    const canUseMulty = getInfo.canUseMultiTime === 'true';
    console.log(canUseMulty);
    return this.groupCoreService.chargeGroupTickets(
      getInfo.terminal,
      getInfo.group,
      getInfo.amount,
      parseInt(getInfo.expire),
      daysofweek,
      users,
      userid,
      getInfo.title,
      canUseMulty ?? false
    );
  }

  async chargePayWallet(getInfo: GroupChargeDto, userid: string): Promise<any> {
    return this.groupCoreService.chargeAmountInGroupUsers(getInfo.amount, getInfo.users, userid);
  }

  async addCHargeHistoryGroupAll(getInfo): Promise<any> {
    return this.groupCoreService.chargeHistoryAddAllGroup(getInfo.id, 11, 'شارژ کیف پول', getInfo.amount);
  }

  private async checkValues(getInfo: GroupChargeDto): Promise<any> {
    if (isEmpty(getInfo.amount) || isEmpty(getInfo.expire) || isEmpty(getInfo.terminal) || isEmpty(getInfo.users))
      throw new FillFieldsException();
  }
  async daysOfWeek(getInfo: GroupChargeDto): Promise<any> {
    let daysofweek = Array();
    if (new Boolean(getInfo.saturday)) daysofweek.push(6);
    if (new Boolean(getInfo.sunday)) daysofweek.push(0);
    if (new Boolean(getInfo.monday)) daysofweek.push(1);
    if (new Boolean(getInfo.tuesday)) daysofweek.push(2);
    if (new Boolean(getInfo.wednesday)) daysofweek.push(3);
    if (new Boolean(getInfo.thursday)) daysofweek.push(4);
    if (new Boolean(getInfo.friday)) daysofweek.push(5);
    return daysofweek;
  }

  async getChargedList(userid: string, groupid: string): Promise<any> {
    const data = await this.groupCoreService.getChargedLists(userid, groupid);
    return successOptWithPagination(data);
  }

  async organizationStartegy(getInfo: OrganizationGroupStrategyDto): Promise<any> {
    // @ts-ignore
    const daysofweek = await this.daysOfWeek(getInfo);
  }

  async getUpdateTerminals(): Promise<any> {
    const users = await this.groupCoreService.getGroupUsers('5c8cc39237fb2e1597345537');
    for (let i = 0; users.length > i; i++) {
      return this.terminalBalanceService.updateterminal(users[i].card, '5c93e604dfd89f6ff118028b');
      console.log(i);
    }
  }

  async updateTerminalBalance(): Promise<any> {
    return this.terminalBalanceService.updateterminal('5c8cc3a5b4ac54159de60232', '5c93e604dfd89f6ff118028b');
  }

  async getUsersGroup(gid: string, userid: string): Promise<any> {
    const data = await this.groupCoreService.getAllUsersGroup(gid, userid);
    return successOptWithDataNoValidation(data);
  }

  async sendToAll(getInfo: SendtoallDto, userid: string, role: string): Promise<any> {
    return this.sendToAllService.submit(getInfo, userid, role);
  }

  async getSendtoallList(userid: string, page: number, gid: string): Promise<any> {
    return this.sendToAllService.getList(userid, page, gid);
  }

  async getHistory(getInfo, page, userid): Promise<any> {
    if (getInfo.type == GroupCardChargeHistoryTypeConst.merchant) {
      return this.cardInfoService.getInfo(getInfo.cardno, page);
    } else if (getInfo.type == GroupCardChargeHistoryTypeConst.charge) {
      return this.cardInfoService.getChargeInfo(getInfo.cardno, page);
    }
  }

  async getTicketsChargeHistoryAll(
    groupId: string,
    page: number,
    type: number,
    start: number,
    end: number,
    userid: string
  ) {
    const getCards = await this.groupsCardService.getCalc(groupId);
    if (getCards.length < 1) throw new UserCustomException(' نتیجه ای یافت نشد');
    return this.groupCoreService.getTicketsChargeHistoryAll(getCards[0].cardId, page, type, start, end, userid);
  }

  async getTicketsHistoryAllExcel(groupId: string, type: number, start: number, end: number, user) {
    const getCards = await this.groupsCardService.getCalc(groupId);
    if (getCards.length < 1) throw new UserCustomException(' نتیجه ای یافت نشد');
    return this.groupCoreService.getGroupTicketsChargeHistoryAllExcel(
      getCards[0].cardId,
      type,
      start,
      end,
      user,
      groupId
    );
  }

  async getHistoryTicket(getInfo, page, userid): Promise<any> {
    if (getInfo.type == GroupCardChargeHistoryTypeConst.merchant) {
      return this.groupCoreService.getUserTicketHistory(getInfo.cardno, page);
    } else if (getInfo.type == GroupCardChargeHistoryTypeConst.charge) {
      return this.groupCoreService.getUserTicketCharge(getInfo.cardno, page);
    }
  }

  async toggleCardStatus(cardId: string): Promise<any> {
    return this.cardService.toggleStatus(cardId);
  }
}
