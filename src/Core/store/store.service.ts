import { Model } from 'mongoose';
import { Injectable, Inject } from '@vision/common';
import { Card } from './interfaces/store.interface';
import { StoreDto } from './dto/store.dto';
import { CardcounterService } from '../useraccount/cardcounter/cardcounter.service';
import * as securepin from 'secure-pin';
import * as luhn from 'cc-luhn';

@Injectable()
export class StoreService {
  constructor(
    @Inject('CardModel') private readonly cardModel: Model<Card>,
    private readonly cardcounterService: CardcounterService
  ) {}

  private async create(createAuthDto: StoreDto): Promise<any> {
    const createdCard = new this.cardModel(createAuthDto);
    return createdCard.save();
  }

  // Generate Card
  async generateCard(user: string) {
    await this.cardcounterService.getCardNumber().then((value) => {
      // make card
      const chksum = luhn(value.seq.toString());
      const newcard = value.seq + chksum;

      // make expire date
      const now = new Date();
      const oneYr = new Date();
      const fullyear = oneYr.setFullYear(now.getFullYear() + 1);

      // make pin
      const pin = securepin.generatePinSync(4);

      // make cvv2
      const cvv2 = securepin.generatePinSync(4);
      const params = StoreService.toParams(newcard, fullyear, pin, cvv2, user);

      // save in database
      return this.create(params);
    });
  }

  private static toParams(cardnox, expirex, pinx, cvv2x, userx) {
    return {
      user: userx,
      cardno: cardnox,
      expire: expirex,
      pin: pinx,
      cvv2: cvv2x,
    };
  }
}
