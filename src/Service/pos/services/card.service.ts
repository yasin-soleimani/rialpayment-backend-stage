import { Injectable } from '@vision/common';
import { CardService } from '../../../Core/useraccount/card/card.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { PosPayRequestDto } from '../dto/pay-req.dto';

@Injectable()
export class PosCardService {
  constructor(private readonly cardService: CardService) {}

  async validateCard(cardno: number, track2: string): Promise<any> {
    const cardInfo = await this.cardService.getCardInfo(cardno);
    if (!cardInfo || cardInfo.cardno != cardno) throw new UserCustomException('کارت نامعتبر');

    if (cardInfo.status == false) throw new UserCustomException('کارت غیرفعال می باشد');

    if (cardInfo.cardno + '=' + cardInfo.secpin != track2) throw new UserCustomException('کارت نامعتبر');
    return cardInfo;
  }
  async rfidCard(getInfo: PosPayRequestDto): Promise<any> {
    const cardInfo = await this.cardService.getCardInfo(getInfo.cardno);
    if (!cardInfo || cardInfo.cardno != getInfo.cardno) throw new UserCustomException('کارت نامعتبر');

    if (cardInfo.status == false) throw new UserCustomException('کارت غیرفعال می باشد');

    if ((getInfo.payid = '0')) return cardInfo;
    if (!cardInfo.serial) {
      await this.cardService.setSerial(cardInfo.cardbo, String(Number(getInfo.payid)));
    } else {
      if (cardInfo.serial != String(Number(getInfo.payid))) throw new UserCustomException('کارت نامعتبر');
    }

    if (cardInfo.secpin != Number(getInfo.secpin)) throw new UserCustomException('کارت نامعتبر');

    return cardInfo;
  }
}
