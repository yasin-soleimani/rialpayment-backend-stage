import { Injectable, InternalServerErrorException, successOpt } from '@vision/common';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { notEnoughMoneyException } from '@vision/common/exceptions/notEnoughMoney.exception';
import { CardService } from '../../../Core/useraccount/card/card.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import * as sha256 from 'sha256';

@Injectable()
export class PaymentRfidService {
  constructor(
    private readonly accountService: AccountService,
    private readonly cardService: CardService,
    private readonly userService: UserService
  ) { }

  async pay(userid: string, amount: number, serialno: string, secpin: any, cardno: number, pin?: any): Promise<any> {
    const cardInfo = await this.cardService.getCardInfo(cardno);
    if (!cardInfo) throw new UserCustomException('کارت نا معتبر');
    if (cardInfo.secpin != Number(secpin)) throw new UserCustomException('کارت نا معتبر');
    if (!cardInfo.serial) {
      await this.cardService.setSerial(cardno, serialno);
    } else {
      if (cardInfo.serial != serialno) throw new UserCustomException('کارت نا معتبر');
    }
    if (cardInfo.user) {
      const userInfo = await this.userService.getInfoByUserid(cardInfo.user);
      if (!userInfo) throw new UserCustomException('کاربر یافت نشد', false, 404);

      if (isEmpty(userInfo.fullname) || userInfo.block === true)
        throw new UserCustomException('کارت مجاز به انجام تراکنش نمی باشد');

      const wallet = await this.accountService.getBalance(cardInfo.user, 'wallet');
      if (!wallet) throw new InternalServerErrorException();

      if (amount > 1999999) {
        if (isEmpty(pin)) {
          throw new UserCustomException('برای تراکنش های بالای 2 میلیون ریال نیاز به رمز کارت می باشد');
        }
        const cardPin = sha256(cardInfo.pin);
        if (pin != cardPin) {
          throw new UserCustomException('رمز کارت نامعتبر', false, 500);
        }
      }

      if (wallet.balance < amount) throw new notEnoughMoneyException();

      return this.transaction(cardInfo.user, userid, amount, cardInfo.cardno);
    } else {
      if (amount > 2000000) throw new UserCustomException('مبلغ غیر مجاز');

      if (cardInfo.amount < amount) throw new notEnoughMoneyException();

      await this.cardService.dechargeAmount(cardInfo._id, amount).then((res) => console.log(res, 'res'));
      await this.accountService.chargeAccount(userid, 'wallet', amount);

      const title = 'پرداخت با کارت ' + cardno;
      this.accountService.accountSetLogg(title, 'ClCard', amount, true, null, userid);
      return successOpt();
    }
  }

  private async transaction(senderid: string, reciverid: string, amount: number, cardno: string): Promise<any> {
    return this.accountService
      .dechargeAccount(senderid, 'wallet', amount)
      .then((res) => {
        if (!res) throw new UserCustomException('پرداخت با خطا مواجه شد');
        return this.accountService
          .chargeAccount(reciverid, 'wallet', amount)
          .then((result) => {
            if (!result) {
              this.accountService.chargeAccount(senderid, 'wallet', amount);
              throw new UserCustomException('پرداخت با خطا مواجه شد');
            }

            const title = 'پرداخت با کارت ' + cardno;
            this.accountService.accountSetLogg(title, 'ClCard', amount, true, senderid, reciverid);
            return successOpt();
          })
          .catch((err) => {
            this.accountService.chargeAccount(senderid, 'wallet', amount);
            throw new UserCustomException('پرداخت با خطا مواجه شد');
          });
      })
      .catch((err) => {
        throw new UserCustomException('پرداخت با خطا مواجه شد');
      });
  }
}
