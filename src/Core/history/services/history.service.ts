import { Inject, Injectable } from '@vision/common';
import { Model, Types } from 'mongoose';

@Injectable()
export class HistoryCoreService {
  constructor(@Inject('HistoryModel') private readonly historyModel: Model<any>) {}

  async bulkInsert(data): Promise<any> {
    let ObjId = Types.ObjectId;
    data.forEach((value) => {
      this.historyModel.insertMany(
        {
          status: value.status,
          user: value.from || value.to,
          amount: value.amount,
          title: value.title,
          createdAt: value.createdAt,
          ref: value.ref,
          mod: 0,
        },
        { ordered: false }
      );

      this.historyModel.insertMany(
        {
          status: value.status,
          user: value.from || value.from,
          amount: value.amount,
          title: value.title,
          createdAt: value.createdAt,
          ref: value.ref,
          mod: 0,
        },
        { ordered: false }
      );
    });
  }
}
