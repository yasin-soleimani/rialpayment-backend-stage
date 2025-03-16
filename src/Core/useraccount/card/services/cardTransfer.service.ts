import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';

@Injectable()
export class CardTransferCoreService {
  constructor(@Inject('CardTransferModel') private readonly cardTransferModel: Model<any>) {}

  async addCardInfo(pan, pin, cvv2, expire, amount, destination_pan, source_user, destination_user): Promise<any> {
    return this.cardTransferModel.create({
      pan: pan,
      pin: pin,
      cvv2: cvv2,
      expire: expire,
      amount: amount,
      destination_pan: destination_pan,
      source_user: source_user,
      destination_user: destination_user,
    });
  }

  async getInfoById(id: string): Promise<any> {
    return this.cardTransferModel.findOne({
      _id: id,
      success: false,
    });
  }

  async setSuccessById(id: string): Promise<any> {
    return this.cardTransferModel.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          success: true,
        },
      }
    );
  }
}
