import { Injectable, successOptWithDataNoValidation } from '@vision/common';
import { CardService } from '../../Core/useraccount/card/card.service';
import * as luhn from 'cc-luhn';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { switchPay } from '@vision/common/utils/PaySwitch';
import { ChargeServiceReturnModel } from './func/return-model.func';

@Injectable()
export class ServiceChargeService {
  constructor(private readonly cardService: CardService) {}

  async getCardInfo(cardno: number): Promise<any> {
    // TODO check request url
    if (!luhn(true, cardno.toString())) {
      throw new UserCustomException('کارت وارد شده صحیح نمی باشد');
    }
    const cardType = switchPay(cardno);
    if (cardType !== 'closeloop') throw new UserCustomException('کارت وارد شده صحیح نمی باشد');

    const cardInfo = await this.cardService.getCardInfo(cardno);
    if (!cardInfo) throw new UserCustomException('کارت وارد شده صحیح نمی باشد');
    return successOptWithDataNoValidation(ChargeServiceReturnModel(cardInfo));
  }
}
