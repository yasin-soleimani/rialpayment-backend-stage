import { Injectable, InternalServerErrorException, successOpt } from '@vision/common';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { CardService } from '../../../Core/useraccount/card/card.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { notEnoughMoneyException } from '@vision/common/exceptions/notEnoughMoney.exception';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { CardChargeHistoryCoreService } from '../../../Core/useraccount/card/services/card-history.service';
import { CardChargeHistoryTypeConst } from '../../../Core/useraccount/card/const/card-charge-type.const';

@Injectable()
export class ChargeRfidService {
  constructor(
    private readonly accountService: AccountService,
    private readonly cardService: CardService,
    private readonly cardHistory: CardChargeHistoryCoreService,
    private readonly userService: UserService
  ) {}

  async chargeRfid(getInfo, userid: string): Promise<any> {
    const userInfo = await this.userService.getInfoByUserid(userid);

    const cardInfo = await this.checkCard(getInfo);
    await this.checkBalance(userid, getInfo.amount);

    return this.charge(getInfo, cardInfo, userid, userInfo);
  }

  private async checkCard(getInfo): Promise<any> {
    const cardInfo = await this.cardService.getCardInfo(getInfo.cardno);
    if (!cardInfo) throw new UserCustomException('کارت یافت نشد', false, 404);

    if (cardInfo.secpin != Number(getInfo.secpin)) throw new UserCustomException('کارت نامعتبر', false, 500);

    return cardInfo;
  }

  private async checkBalance(userid: string, amount: number): Promise<any> {
    const wallet = await this.accountService.getBalance(userid, 'wallet');
    if (!wallet) throw new InternalServerErrorException();

    if (wallet.balance < amount) throw new UserCustomException('موجودی حساب شما کافی نمیباشد');
  }

  private async charge(getInfo, cardInfo, userid, userInfo): Promise<any> {
    const decharge = await this.accountService.dechargeAccount(userid, 'wallet', getInfo.amount);
    if (!decharge) throw new InternalServerErrorException();

    if (cardInfo.user) {
      const charge = await this.accountService.chargeAccount(cardInfo.user, 'wallet', getInfo.amount);
      if (!charge) {
        this.accountService.chargeAccount(userid, 'wallet', getInfo.amount);
        throw new InternalServerErrorException();
      }

      const title = 'شارژ کارت ' + cardInfo.cardno + ' توسط ' + userInfo.fullname;
      this.accountService.accountSetLogg(title, 'ClCharge-', getInfo.amount, true, userid, cardInfo.user);

      this.cardHistory.addNew(
        userid,
        cardInfo._id,
        getInfo.amount,
        title,
        CardChargeHistoryTypeConst.RFIDcharge,
        cardInfo.cardno
      );
    } else {
      const charge = await this.cardService.chargeCard(cardInfo._id, getInfo.amount);
      if (!charge) {
        this.accountService.chargeAccount(userid, 'wallet', getInfo.amount);
        throw new InternalServerErrorException();
      }

      const title = 'شارژ کارت ' + cardInfo.cardno + ' توسط ' + userInfo.fullname;
      this.accountService.accountSetLogg(title, 'ClCharge-', getInfo.amount, true, userid, null);

      this.cardHistory.addNew(
        userid,
        cardInfo._id,
        getInfo.amount,
        title,
        CardChargeHistoryTypeConst.RFIDcharge,
        cardInfo.cardno
      );
    }

    return successOpt();
  }
}
