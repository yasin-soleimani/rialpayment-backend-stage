import { Inject, Injectable } from '@vision/common';
import { Model } from 'mongoose';
import { MerchantSettlementsModel, MerchantSettlementsModelSchema } from '../models/merchant-settlements.model';

@Injectable()
export class MerchantSettlementsService {
  constructor(
    @Inject('MerchantSettlementsModel')
    private readonly merchantSettleModel: Model<MerchantSettlementsModelSchema>
  ) {}

  async create(data: MerchantSettlementsModel): Promise<MerchantSettlementsModel> {
    return this.merchantSettleModel.create(data);
  }

  async update(_id, data: Partial<MerchantSettlementsModel>): Promise<MerchantSettlementsModel> {
    return this.merchantSettleModel.findOneAndUpdate({ _id }, data, { new: true });
  }
}
