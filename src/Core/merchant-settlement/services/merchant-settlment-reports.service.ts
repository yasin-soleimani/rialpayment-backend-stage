import { Inject, Injectable } from '@vision/common';
import { Model } from 'mongoose';
import {
  MerchantSettlementReportModel,
  MerchantSettlementReportModelSchema,
} from '../models/merchant-settlement-report.model';

@Injectable()
export class MerchantSettlementReportsService {
  constructor(
    @Inject('MerchantSettlementReportModel')
    private readonly merchantSettleReportModel: Model<MerchantSettlementReportModelSchema>
  ) {}

  async create(data: MerchantSettlementReportModel): Promise<MerchantSettlementReportModel> {
    return this.merchantSettleReportModel.create(data);
  }

  async update(_id, data: Partial<MerchantSettlementReportModel>): Promise<MerchantSettlementReportModel> {
    return this.merchantSettleReportModel.findOneAndUpdate({ _id }, data, { new: true });
  }

  async checkIfLastDateDone(date: string): Promise<boolean> {
    const data = await this.merchantSettleReportModel.countDocuments({ date: date });
    return data > 0;
  }
}
