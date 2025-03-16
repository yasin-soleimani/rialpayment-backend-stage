import { Inject, Injectable } from '@vision/common';

@Injectable()
export class OrganizationNewChargeCoreAnalyzeService {
  constructor(@Inject('OrganizationNewChargeModel') private readonly chargeModel: any) {}

  async getCalc(cards, users): Promise<any> {
    return this.chargeModel.aggregate([
      {
        $match: {
          $or: [{ user: { $in: users } }, { card: { $in: cards } }],
          in: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          amount: { $sum: '$in' },
        },
      },
    ]);
  }
}
