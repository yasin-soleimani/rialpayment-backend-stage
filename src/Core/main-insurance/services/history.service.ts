import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';
import { MainInsuranceHistoryDto } from '../dto/history.dto';

@Injectable()
export class MainInsuranceHistoryCoreService {
  constructor(@Inject('MainInsuranceHistoryModel') private readonly historyModel: Model<any>) {}

  async addNew(getInfo: MainInsuranceHistoryDto): Promise<any> {
    return this.historyModel.create(getInfo);
  }

  async getInfoById(id: string): Promise<any> {
    return this.historyModel.findOne({ _id: id }).populate('product');
  }

  async updateStatus(id: string, status: boolean, link: string, bno: string): Promise<any> {
    return this.historyModel.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          status: status,
          link: link,
          bno: bno,
        },
      }
    );
  }
}
