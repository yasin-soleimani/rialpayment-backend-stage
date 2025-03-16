import { Injectable, Inject } from '@vision/common';
import { Model, Types } from 'mongoose';
import { getTodayStartDayUtc, get10PmClock } from '@vision/common/utils/month-diff.util';

@Injectable()
export class LogegerCoreTodayService {
  constructor(@Inject('LoggerModel') private readonly loggerService: Model<any>) {}

  async getMobileCharge(from, to): Promise<any> {
    return this.loggerService.aggregate([
      {
        $match: {
          ref: { $regex: new RegExp('MobileCharge-+') },
          createdAt: {
            $gte: from,
            $lte: to,
          },
          status: true,
        },
      },
      {
        $group: {
          _id: null,
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);
  }

  async getTodayTransAmount(userid: string): Promise<any> {
    const today = get10PmClock();
    let ObjId = Types.ObjectId;

    return this.loggerService.aggregate([
      {
        $match: {
          to: ObjId(userid),
          createdAt: { $gte: today },
          $or: [
            { ref: { $regex: new RegExp('ShopTrans-+') } },
            { ref: { $regex: new RegExp('DirectIpg-+') } },
            { ref: { $regex: new RegExp('WageIpg-+') } },
            { ref: { $regex: new RegExp('Ipg-+') } },
            { ref: /Wage-/ },
          ],
          status: true,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          counter: { $sum: 1 },
        },
      },
    ]);
  }

  async getTodayAuthorizePay(userid: string): Promise<any> {
    const today = getTodayStartDayUtc();
    let ObjId = Types.ObjectId;

    return this.loggerService.aggregate([
      {
        $match: {
          to: ObjId(userid),
          createdAt: { $gte: today },
          $or: [{ ref: { $regex: new RegExp('AuthTrans-+') } }],
          status: true,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          counter: { $sum: 1 },
        },
      },
    ]);
  }
}
