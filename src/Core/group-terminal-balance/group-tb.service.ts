import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@vision/common';
import { notEnoughMoneyException } from '@vision/common/exceptions/notEnoughMoney.exception';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { GroupCoreService } from '../group/group.service';
import { MerchantcoreService } from '../merchant/merchantcore.service';
import { MerchantCoreTerminalBalanceService } from '../merchant/services/merchant-terminal-balance.service';
import { MerchantCoreTerminalService } from '../merchant/services/merchant-terminal.service';
import { TurnoverBalanceCoreService } from '../turnover/services/balance.service';
import { AccountService } from '../useraccount/account/account.service';
import { CardService } from '../useraccount/card/card.service';
import { CardChargeHistoryTypeConst } from '../useraccount/card/const/card-charge-type.const';
import { CardChargeHistoryCoreService } from '../useraccount/card/services/card-history.service';
import { UserService } from '../useraccount/user/user.service';
import * as mongoose from 'mongoose';
import { ObjectId } from 'bson';
import { MerchantShareService } from '../merchant/services/merchant-share.service';

@Injectable()
export class CoreGroupTerminalBalanceService {
  constructor(
    private readonly balanceService: MerchantCoreTerminalBalanceService,
    private readonly merchantServcie: MerchantcoreService,
    private readonly terminalService: MerchantCoreTerminalService,
    private readonly accountService: AccountService,
    private readonly cardService: CardService,
    private readonly cardHistory: CardChargeHistoryCoreService,
    private readonly turnoverService: TurnoverBalanceCoreService,
    private readonly userService: UserService,
    private readonly merchantShareService: MerchantShareService
  ) {}

  async getTerminalByUserId(userId: string): Promise<any> {
    const merchants = await this.merchantServcie.getMerchantsByUserId(userId);
    if (!merchants) return false;

    const terminals = Array();

    for (const info of merchants) {
      const terminal = await this.terminalService.getTerminalsByMerchantId(info._id);

      for (const item of terminal) {
        terminals.push(item._id);
      }
    }
    return terminals;
  }
  async getMerchantsByUserIdAll(userId: string | ObjectId[], multi = false): Promise<any> {
    const merchants = await this.merchantServcie.getMerchantsByUserIdAll(userId, multi);
    if (!merchants) return false;

    const terminals = Array();

    for (const info of merchants) {
      const terminal = await this.terminalService.getTerminalsByMerchantId(info._id);

      for (const item of terminal) {
        terminals.push(item._id);
      }
    }
    return terminals;
  }

  async getBalanceByUser(terminals, userId): Promise<any> {
    if (!terminals) return 0;
    if (!userId) return 0;

    const data = await this.balanceService.getBalanceInTerminalsStore(terminals, userId);
    const discount = await this.accountService.getBalance(userId, 'discount');

    if (discount.balance < data[0]?.amount) {
      return discount.balance;
    } else {
      return data[0]?.amount;
    }
  }

  async getBalanceByCard(terminals, cardId): Promise<any> {
    if (!terminals) return 0;
    if (!cardId) return 0;

    const data = await this.balanceService.getBalanceInStoreTerminalWithCard(terminals, cardId);

    if (data.length > 0) {
      return data[0]?.amount;
    } else {
      return 0;
    }
  }

  async getBalanceInTerminals(ref: string, userId: string): Promise<any> {
    const userInfo = await this.userService.getInfoByUserid(userId);
    const cardInfo = await this.cardService.getCardInfoById(userId);
    console.log("user info yasin:::", userInfo);
    console.log("card info yasin:::", cardInfo);
    if (userInfo) {
      return this.getUserBalanceInTerminals(ref, userId);
    } else if (cardInfo) {
      if (cardInfo.user) return this.getUserBalanceInTerminals(ref, cardInfo.user);
      return this.getCardBalanceInTerminals(ref, userId);
    } else {
      throw new NotFoundException('یافت نشد');
    }
  }

  async getUserBalanceInTerminals(ref: string, userId: string): Promise<any> {
    console.log("opened service yasin:::");
    const userInfo = await this.userService.getInfoByUserid(userId);
    console.log("find user in service:::", userInfo);
    // if (userInfo) if (userInfo.ref != ref) throw new UnauthorizedException();

    const shares = await this.merchantShareService.getSharesByToId(ref);
    const array = [mongoose.Types.ObjectId(ref)];
    for (const share of shares) array.push(mongoose.Types.ObjectId(share.shareFromUser as string));
    const terminals = await this.getMerchantsByUserIdAll(array, true);
    console.log("process 1 yasin:::");

    //const terminals = await this.getMerchantsByUserIdAll(ref);
    if (terminals.length < 1) return [];

    console.log("process 2 yasin:::");

    const tmp = Array();

    for (const terminal of terminals) {
      const terminalId = [];
      terminalId.push(terminal);
      const balance = await this.getBalanceByUser(terminalId, userId);

      const terminalInfo = await this.terminalService.getInfoByID(terminal);
      if (terminalInfo) {
        tmp.push({
          user: userId,
          terminalid: terminal,
          balance: balance ?? 0,
          terminaltitle: terminalInfo.title,
        });
      }

      console.log("process 3 yasin:::");
    }

    return tmp;
  }

  async getCardBalanceInTerminals(ref: string, cardId: string): Promise<any> {
    //const cardInfo = await this.cardService.getCardInfoById(cardId);
    //if (cardInfo.ref != ref) throw new UnauthorizedException();

    const shares = await this.merchantShareService.getSharesByToId(ref);
    const array = [mongoose.Types.ObjectId(ref)];
    for (const share of shares) array.push(mongoose.Types.ObjectId(share.shareFromUser as string));
    const terminals = await this.getMerchantsByUserIdAll(array, true);
    //const terminals = await this.getMerchantsByUserIdAll(ref);
    if (terminals.length < 1) return [];

    const tmp = Array();

    for (const terminal of terminals) {
      const terminalId = [];
      terminalId.push(terminal);
      const balance = await this.getBalanceByCard(terminalId, cardId);

      const terminalInfo = await this.terminalService.getInfoByID(terminal);
      if (terminalInfo) {
        tmp.push({
          user: cardId,
          terminalid: terminal,
          balance: balance,
          terminaltitle: terminalInfo.title,
        });
      }
    }

    return tmp;
  }

  async deChargeBalance(ref: string, userId: string, terminalId: string, amount: number): Promise<any> {
    const userInfo = await this.userService.getInfoByUserid(userId);
    const cardInfo = await this.cardService.getCardInfoById(userId);
    if (userInfo) {
      return this.deChargeUser(ref, userId, terminalId, amount);
    } else if (cardInfo) {
      if (cardInfo.user) return this.deChargeUser(ref, cardInfo.user, terminalId, amount);

      return this.dechargeCard(ref, userId, terminalId, amount);
    } else {
      throw new NotFoundException('یافت نشد');
    }
  }

  async deChargeUser(ref: string, userId: string, terminalId: string, amount: number): Promise<any> {
    const userInfo = await this.userService.getInfoByUserid(userId);
    // if (userInfo && userInfo.ref != ref) throw new UnauthorizedException();

    const terminalInfo = await this.terminalService.getInfoByID(terminalId);
    if (!terminalInfo) throw new UserCustomException('شما به این ترمینال دسترسی ندارید');

    const shares = await this.merchantShareService.getSharesByToId(ref);
    const array = [mongoose.Types.ObjectId(ref)];
    for (const share of shares) array.push(mongoose.Types.ObjectId(share.shareFromUser as string));
    const terminals = await this.getMerchantsByUserIdAll(array, true);

    if (
      terminalInfo.ref == ref ||
      terminalInfo.user == ref ||
      terminalInfo?.merchant?.ref == ref ||
      terminalInfo?.merchant?.user == ref ||
      (terminals.length > 0 && terminals.some((item) => item.toString() === terminalId.toString()))
    ) {
      const balance = await this.getBalanceByUser([new mongoose.Types.ObjectId(terminalId)], userId);
      if (balance < amount) throw new notEnoughMoneyException();

      return this.balanceService.dechargeStoreInBalnce(terminalId, userId, amount).then(async (res) => {
        if (!res) return false;

        const title = ' کسر از اعتبار در فروشگاه ' + terminalInfo.title;
        const ref = 'discount-' + new Date().getTime();
        this.accountService.accountSetLoggWithRef(title, ref, amount, true, userId, null);
        this.accountService.dechargeAccount(userId, 'discount', amount);
        const cardInfo = await this.cardService.getCardByUserID(userId);
        this.cardHistory.addNew(
          userId,
          cardInfo._id,
          amount,
          title,
          CardChargeHistoryTypeConst.AgentBalanceDecharge,
          cardInfo.cardno
        );

        this.turnoverService.dechargeUser('discount', userId, amount, ref, title);
        return true;
      });
    } else {
      throw new UserCustomException('شما به این ترمینال دسترسی ندارید');
    }
  }

  async dechargeCard(ref: string, cardId: string, terminalId: string, amount: number): Promise<any> {
    const cardInfo = await this.cardService.getCardInfoById(cardId);
    //if (cardInfo.ref != ref) throw new UnauthorizedException();

    const terminalInfo = await this.terminalService.getInfoByID(terminalId);
    if (!terminalInfo) throw new UserCustomException('شما به این ترمینال دسترسی ندارید');
    console.log(terminalInfo);
    if (
      terminalInfo.ref == ref ||
      terminalInfo.user == ref ||
      terminalInfo?.merchant?.ref == ref ||
      terminalInfo?.merchant?.user == ref
    ) {
      const balance = await this.getBalanceByCard([new mongoose.Types.ObjectId(terminalId)], cardId);
      console.log(balance, terminalId, cardId);
      if (balance < amount) throw new notEnoughMoneyException();

      return this.balanceService.dechargeStoreWithCard(terminalId, cardId, amount).then(async (res) => {
        if (!res) return false;

        const title = ' کسر از اعتبار در فروشگاه ' + terminalInfo.title;
        const ref = 'discount-' + new Date().getTime();

        this.cardHistory.addNew(
          null,
          cardInfo._id,
          amount,
          title,
          CardChargeHistoryTypeConst.AgentBalanceDecharge,
          cardInfo.cardno
        );

        this.turnoverService.dechargeCard('discount', cardInfo._id, amount, ref, title);

        return true;
      });
    } else {
      throw new UserCustomException('شما به این ترمینال دسترسی ندارید');
    }
  }

  async dechargeClub(): Promise<any> {
    // const data = await this.groupService.findUsers('61e04b57ccc8875440ef1caf');
    // console.log(data, 'data');
    // for (const item of data) {
    //   console.log(item, 'item');
    //   const discount = await this.accountService.getBalance(item.user, 'discount');
    //   if (discount.balance > 50000000) {
    //     this.accountService.dechargeAccount(item.user, 'discount', 50000000).then((res) => {
    //       console.log(res, 'res');
    //     });
    //   }
    // }
  }
}
