import { Injectable, successOptWithDataNoValidation } from '@vision/common';
import { CardService } from '../../../Core/useraccount/card/card.service';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { PaymentDto } from '../dto/payment.dto';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { PaymentsService } from './payments.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { sendNotif } from '@vision/common/notify/notify.util';
import { TrasnferReturn } from '@vision/common/formatter/switch.format';
import { sendSocketMessage } from '@vision/common/notify/socket.util';

@Injectable()
export class PaymentCarsTransApiService {
  constructor(
    private readonly cardService: CardService,
    private readonly userService: UserService,
    private readonly accountService: AccountService
  ) {}

  async play(getInfo: PaymentDto, userid: string): Promise<any> {
    const cardInfo = await this.cardService.getCardInfo(getInfo.payid);
    if (!cardInfo) throw new UserCustomException('کارت یافت نشد', false, 404);

    const user = await this.userService.getInfoByUserid(userid);

    let fullname;
    if (user.fullname) {
      fullname = user.fullname;
    } else {
      fullname = user.mobile;
    }
    if (!user) throw new UserCustomException('کاربر نامعتبر');
    if (cardInfo.user) {
      return this.withUser(getInfo, cardInfo, user, fullname);
    } else {
      return this.withoutUser(getInfo, cardInfo, user, fullname);
    }
  }

  private async withUser(getInfo: PaymentDto, cardInfo: any, user: any, fullname: string): Promise<any> {
    await this.accountService.dechargeAccount(user._id, 'wallet', getInfo.amount);
    await this.accountService.chargeAccount(cardInfo.user._id, 'wallet', getInfo.amount);

    let title;
    if (isEmpty(getInfo.description)) {
      title = 'انتقال وجه به ' + cardInfo.cardno + ' توسط ' + fullname;
    } else {
      title = 'انتقال وجه به ' + cardInfo.cardno + ' توسط ' + fullname + '-' + getInfo.description;
    }
    const logInfo = await this.accountService.accountSetLogg(
      title,
      'CardTrans',
      getInfo.amount,
      true,
      user._id,
      cardInfo.user._id
    );

    const message = 'مبلغ : ' + getInfo.amount + ' ریال \n' + 'پرداخت با موفقیت انجام شد';
    sendNotif(cardInfo.user.fcm, getInfo.amount, 2);
    sendSocketMessage(cardInfo.user.clientid, message).catch((e) => console.log('send socket message error: ', e));
    return successOptWithDataNoValidation(
      TrasnferReturn(cardInfo.cardno, user.fullname, getInfo.amount, logInfo.ref, [], '')
    );
  }

  private async withoutUser(getInfo: PaymentDto, cardInfo: any, user: any, fullname: string): Promise<any> {
    await this.accountService.dechargeAccount(user._id, 'wallet', getInfo.amount);
    await this.cardService.chargeCard(cardInfo._id, getInfo.amount);
    let title;
    if (isEmpty(getInfo.description)) {
      title = 'انتقال وجه به ' + cardInfo.cardno + ' توسط ' + fullname;
    } else {
      title = 'انتقال وجه به ' + cardInfo.cardno + ' توسط ' + fullname + '-' + getInfo.description;
    }
    const logInfo = await this.accountService.accountSetLogg(title, 'CardTrans', getInfo.amount, true, user._id, null);
    return successOptWithDataNoValidation(
      TrasnferReturn(cardInfo.cardno, fullname, getInfo.amount, logInfo.ref, [], '')
    );
  }
}
