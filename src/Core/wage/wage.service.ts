import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';
import { WageSystemCoreDto } from './dto/wage.dto';

@Injectable()
export class WageCoreService {
  constructor(@Inject('WageSystemModel') private readonly wageModel: any) {}

  async addWage(getInfo: WageSystemCoreDto): Promise<any> {
    return this.wageModel.create(getInfo);
  }

  async getAll(query): Promise<any> {
    return this.wageModel.find(query);
  }

  async remove(id: string): Promise<any> {
    return this.wageModel.findOneAndRemove(id);
  }

  async getSearch(query, page): Promise<any> {
    return this.wageModel.paginate(query, { page: page, sort: { createdAt: 1 }, limit: 50 });
  }

  async getLast(type: number): Promise<any> {
    return this.wageModel.findOne({ type: type }).sort({ createdAt: -1 });
  }

  async getFilter(query): Promise<any> {
    return this.wageModel.aggregate([
      {
        $match: query,
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          totalwage: { $sum: '$wage.total' },
          companywage: { $sum: '$wage.company' },
          agentwage: { $sum: '$wage.agent' },
          merchantwage: { $sum: '$wage.merchant' },
          count: { $sum: 1 },
        },
      },
    ]);
  }
}
