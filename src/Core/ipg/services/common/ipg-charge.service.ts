import { Injectable, Inject } from '@vision/common';
import { Model, Types } from 'mongoose';
import { getTodayStartDayUtc } from '@vision/common/utils/month-diff.util';

@Injectable()
export class IpgCoreCharegService {
  constructor(@Inject('IpgModel') private readonly ipgModel: Model<any>) {}

  async getTodayCharge(userid: string): Promise<any> {
    const today = getTodayStartDayUtc();
    let ObjId = Types.ObjectId;

    return this.ipgModel.aggregate([
      { $match: { user: ObjId(userid), createdAt: { $gte: today }, 'details.respcode': { $eq: 0 } } },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          counter: { $sum: 1 },
        },
      },
    ]);
  }
}
