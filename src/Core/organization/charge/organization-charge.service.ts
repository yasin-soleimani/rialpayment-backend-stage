import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';

@Injectable()
export class OrganizationChargeService {
  constructor(@Inject('OrganizationChargeModel') private readonly chargeModel: any) {}

  async charge(by: string, userid: string, organ: string, amount: number): Promise<any> {
    return this.chargeModel.create({
      by: by,
      amount: amount,
      user: userid,
      organ: organ,
    });
  }

  async chargeCard(by: string, cardid: string, organ: string, amount: number): Promise<any> {
    return this.chargeModel
      .create({
        by: by,
        amount: amount,
        card: cardid,
        organ: organ,
      })
      .then((res) => {
        console.log(res);
        return res;
      });
  }

  async getBalance(userid: string): Promise<any> {
    return this.chargeModel.findOne({ user: userid });
  }

  async getCardBalance(cardid: string): Promise<any> {
    return this.chargeModel.findOne({ card: cardid });
  }

  async decharge(userid: string, amount: number): Promise<any> {
    return this.chargeModel.findOneAndUpdate({ user: userid }, { $inc: { amount: -amount } });
  }

  async dechargeCard(cardid: string, amount: number): Promise<any> {
    return this.chargeModel.findOneAndUpdate(
      {
        card: cardid,
      },
      {
        $inc: { amount: -amount },
      }
    );
  }
}
