import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import * as securePin from 'secure-pin';
import { getDiffBySecond, dateFormatYearMonth } from '@vision/common/utils/month-diff.util';
import { DynamicPinConsts } from '@vision/common/constants/dynamic-pin.const';

@Injectable()
export class CardDynamicPassCoreService {
  constructor(
    @Inject('CardDynamicPassModel') private readonly dynamicPassModel: Model<any>,
    @Inject('CardModel') private readonly cardModel: any
  ) {}

  async generate(cardno: number, userid: string): Promise<any> {
    const cardInfo = await this.cardModel.findOne({ cardno: cardno });
    if (!cardInfo) throw new UserCustomException('کارت یافت نشد', false, 404);

    if (cardInfo.user != userid) throw new UserCustomException('شما به این کارت دسترسی ندارید', false, 401);
    const pin = securePin.generatePinSync(8);

    return this.dynamicPassModel.create({
      cardno: cardInfo.cardno,
      pin: pin,
      card: cardInfo._id,
      type: 1,
    });
  }

  async checkPin(cardno: number, pin: string): Promise<any> {
    const cardInfo = await this.cardModel.findOne({ cardno: cardno });
    if (!cardInfo) return { code: DynamicPinConsts.cardFound };

    const pinInfo = await this.getLastPin(cardno);
    const sec = getDiffBySecond(pinInfo.createdAt);

    if (sec > 62) return { code: DynamicPinConsts.expired };

    if (pinInfo.pin != pin) return { code: DynamicPinConsts.invalidPin };

    return { code: DynamicPinConsts.success };
  }

  async getLastPin(cardno: number): Promise<any> {
    return this.dynamicPassModel.findOne({ cardno: cardno }).sort({ createdAt: -1 });
  }
}
