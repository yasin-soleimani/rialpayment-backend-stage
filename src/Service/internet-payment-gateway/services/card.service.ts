import { Injectable } from '@vision/common';
import { CardService } from '../../../Core/useraccount/card/card.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { CardDynamicPassCoreService } from '../../../Core/useraccount/card/services/dynamic-pass.service';
import { getLast5Digits, checkExpireCard } from '../function/format.func';
import * as Sha256 from 'sha256';

@Injectable()
export class InternetPaymentGatewayCardService {
  constructor(
    private readonly cardService: CardService,
    private readonly dynamicPassService: CardDynamicPassCoreService
  ) {}

  async cardValidation(cardno, pin, expireDate, cvv2): Promise<any> {
    const cardInfo = await this.cardService.getCardInfo(cardno);
    if (!cardInfo || cardInfo.cardno != cardno) throw new UserCustomException('کارت نا معتبر', false, 400);

    const expire = checkExpireCard(cardInfo.expire, expireDate);

    if (!expire) throw new UserCustomException('کارت نا معتبر', false, 400);
    if (Number(cvv2) != cardInfo.cvv2) throw new UserCustomException('کارت نا معتبر', false, 400);
    if (cardInfo.user) {
      return this.userMode(cardInfo, pin);
    } else {
      return this.GuestMode(cardInfo, pin);
    }
  }

  async userMode(cardInfo, pin): Promise<any> {
    const otp = await this.dynamicPassService.checkPin(cardInfo.cardno, pin);
    if (otp.code != 0) throw new UserCustomException('کارت نا معتبر', false, 400);

    return {
      status: true,
      cardno: cardInfo.cardno,
      track2: cardInfo.cardno + '=' + cardInfo.secpin,
      pin: Sha256(cardInfo.pin),
    };
  }

  async GuestMode(cardInfo, pin): Promise<any> {
    const last5digits = getLast5Digits(cardInfo.cardno);
    if (pin != last5digits) throw new UserCustomException('کارت نامعتبر', false, 400);

    return {
      status: true,
      cardno: cardInfo.cardno,
      track2: cardInfo.cardno + '=' + cardInfo.secpin,
      pin: Sha256(cardInfo.pin),
    };
  }
}
