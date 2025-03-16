import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';

@Injectable()
export class VoucherListCoreService {
  constructor(@Inject('VoucherListModel') private readonly listModel: Model<any>) {}

  async add(title: string, amount: number, discount: number): Promise<any> {
    return this.listModel.create({
      title: title,
      amount: amount,
      discount: discount,
    });
  }

  async changeStatus(id: string, status: boolean): Promise<any> {
    return this.listModel.findOneAndUpdate(
      { _id: id },
      {
        $set: { status: status },
      }
    );
  }

  async getList(): Promise<any> {
    return this.listModel.find({ status: true });
  }

  async getInfo(id: string): Promise<any> {
    return this.listModel.findOne({ _id: id });
  }
}
