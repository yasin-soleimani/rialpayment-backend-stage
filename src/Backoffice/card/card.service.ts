import { faildOpt, Injectable, InternalServerErrorException, NotFoundException, successOpt } from '@vision/common';
import { BackofficeCardDto } from './dto/card.dto';
import { switchPay } from '@vision/common/utils/PaySwitch';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { CardService } from '../../Core/useraccount/card/card.service';
import { CardmanagementcoreService } from '../../Core/cardmanagement/cardmanagementcore.service';
import * as luhn from 'cc-luhn';
import { DuplicateException } from '@vision/common/exceptions/dup.exception';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';

@Injectable()
export class BackofficeCardService {
  constructor(
    private readonly cardService: CardService,
    private readonly shetabCardService: CardmanagementcoreService
  ) {}

  async changeCard(getInfo: BackofficeCardDto): Promise<any> {
    const type = this.checkCardType(getInfo.new, getInfo.old);

    switch (type) {
      case 'closeloop':
        return this.changeCloseloop(getInfo);

      case 'shetab':
        return this.changeShetab(getInfo);

      default:
        throw new InternalServerErrorException();
    }
  }

  private async changeCloseloop(getInfo: BackofficeCardDto): Promise<any> {
    const data = await this.cardService.getCardInfo(getInfo.old);
    if (!data) throw new NotFoundException('کارت یافت نشد');

    const newCard = await this.cardService.getCardInfo(getInfo.new);
    if (newCard.user) throw new DuplicateException();

    const lastCard = await this.cardService.getLastCard();
    if (getInfo.new > lastCard) throw new UserCustomException('کارت نامعتبر می باشد');

    return this.cardService.changeCardAdmin(getInfo.old, getInfo.new).then((result) => {
      if (result) return successOpt();

      return faildOpt();
    });
  }

  private async changeShetab(getInfo: BackofficeCardDto): Promise<any> {
    const data = await this.shetabCardService.getCardInfo(getInfo.old);
    if (!data) if (!data) throw new NotFoundException('کارت یافت نشد');

    const newCard = await this.shetabCardService.getCardInfo(getInfo.new);
    if (newCard) throw new DuplicateException();

    return this.shetabCardService.chanegCard(getInfo.old, getInfo.new).then((result) => {
      if (result) return successOpt();
      return faildOpt();
    });
  }

  async removeShetabCard(cardno): Promise<any> {
    const data = await this.shetabCardService.getCardInfo(cardno);
    if (!data) if (!data) throw new NotFoundException('کارت یافت نشد');

    return this.shetabCardService.remove(cardno).then((result) => {
      if (result) return successOpt();
      return faildOpt();
    });
  }

  async changeSecpin(getInfo: BackofficeCardDto): Promise<any> {
    if (isEmpty(getInfo.card) || isEmpty(getInfo.secpin)) throw new FillFieldsException();

    const cardType = switchPay(getInfo.card);
    if (cardType != 'closeloop') throw new UserCustomException('کارت صحیح نمی باشد');

    const data = await this.cardService.getCardInfo(getInfo.card);
    if (!data) throw new NotFoundException('کارت یافت نشد');

    return this.cardService.changeSecpinAdmin(getInfo.card, getInfo.secpin).then((result) => {
      if (result) return successOpt();
      return faildOpt();
    });
  }

  async changeStatus(getInfo: BackofficeCardDto): Promise<any> {
    if (isEmpty(getInfo.card) || isEmpty(getInfo.status)) throw new FillFieldsException();
    const cardType = switchPay(getInfo.card);
    if (cardType != 'closeloop') throw new UserCustomException('کارت صحیح نمی باشد');

    const data = await this.cardService.getCardInfo(getInfo.card);
    if (!data) throw new NotFoundException('کارت یافت نشد');

    return this.cardService.changeStatusAdmin(getInfo.card, getInfo.status).then((result) => {
      if (result) return successOpt();
      return faildOpt();
    });
  }

  async changePassword(getInfo: BackofficeCardDto): Promise<any> {
    if (isEmpty(getInfo.card) || isEmpty(getInfo.pin)) throw new FillFieldsException();

    const cardType = switchPay(getInfo.card);
    if (cardType != 'closeloop') throw new UserCustomException('کارت صحیح نمی باشد');

    const data = await this.cardService.getCardInfo(getInfo.card);
    if (!data) throw new NotFoundException('کارت یافت نشد');

    if (getInfo.pin.toString().length > 4 || getInfo.pin.toString().length < 4)
      throw new UserCustomException('تعداد پین مجاز نمی باشد');

    return this.cardService.changePasswordAdmin(getInfo.card, getInfo.pin).then((result) => {
      if (result) return successOpt();
      return faildOpt();
    });
  }

  private checkCardType(newcard: number, oldcard: number) {
    const oldBin = switchPay(oldcard);
    const newBin = switchPay(newcard);

    if (oldBin != newBin) throw new UserCustomException('نوع کارت صحیح نمی باشد');

    if (!luhn(true, newcard) || !luhn(true, oldcard)) throw new UserCustomException('قالب بندی کارت صحیح نمی باشد');

    return oldBin;
  }
}
