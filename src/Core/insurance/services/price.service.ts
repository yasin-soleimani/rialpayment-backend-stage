import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';

@Injectable()
export class NationalInsurancePriceCommonCoreService {
  constructor(@Inject('NationalInsurancePriceModel') private readonly priceModel: Model<any>) {}

  async new(type: number, price: number, division: number, category): Promise<any> {
    return this.priceModel.findOneAndUpdate(
      { category: category },
      {
        type: type,
        price: price,
        division: division,
      },
      { new: true, upsert: true }
    );
  }

  async getCategoryPrice(categoryid: string): Promise<any> {
    return this.priceModel
      .findOne({
        category: categoryid,
      })
      .populate('category');
  }
}
