import { Inject, Injectable } from '@vision/common';
import { Model } from 'mongoose';
import {
  MerchantSettlementCashoutModel,
  MerchantSettlementCashoutModelSchema,
} from '../models/merchant-settlement-cashout.model';

@Injectable()
export class MerchantSettlementCashoutService {
  constructor(
    @Inject('MerchantSettlementsCashoutModel')
    private readonly merchantSettleModel: Model<MerchantSettlementCashoutModelSchema>
  ) {}

  async create(data: MerchantSettlementCashoutModel): Promise<MerchantSettlementCashoutModel> {
    return this.merchantSettleModel.create(data);
  }

  async getLastCashoutUser(user: string): Promise<MerchantSettlementCashoutModel> {
    return this.merchantSettleModel.findOne({ user }).sort({ createdAt: -1 });
  }

  async getLastCashoutMerchant(merchant: string): Promise<MerchantSettlementCashoutModel> {
    return this.merchantSettleModel.findOne({ merchant }).sort({ createdAt: -1 });
  }
}
