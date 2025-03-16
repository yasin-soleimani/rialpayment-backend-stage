import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';

@Injectable()
export class BanksCoreService {
  constructor(@Inject('BankModel') private readonly banksModel: Model<any>) {}

  async getList(query: string): Promise<any> {
    return this.banksModel.find({
      title: new RegExp(query),
    });
  }

  async changeStatus(id: string, status: boolean): Promise<any> {
    return this.banksModel.findOneAndUpdate({ _id: id }, { $set: { status: status } });
  }

  async getInfoByCode(code: number): Promise<any> {
    return this.banksModel.findOne({ code: code });
  }
}
