import { Injectable, Inject } from '@vision/common';
import { Model, Types } from 'mongoose';
import { todayRange, dateRange } from '@vision/common/utils/month-diff.util';

@Injectable()
export class VoucherCommonService {
  constructor(@Inject('VoucherModel') private readonly voucherModel: any) {}

  async genNewVoucher(
    amount,
    by,
    hek,
    hmac,
    expire,
    data,
    type,
    total,
    discount,
    percent,
    ref,
    serial,
    mobile?
  ): Promise<any> {
    return this.voucherModel.create({
      amount: amount,
      by: by,
      hek: hek,
      hmac: hmac,
      percent: percent,
      expire: expire,
      data: data,
      type: type,
      totalamount: total,
      discount: discount,
      mobile: mobile,
      ref: ref,
      serial: serial,
    });
  }

  async getLast(userid: string): Promise<any> {
    return this.voucherModel.findOne({ by: userid }).sort({ createdAt: -1 });
  }

  async getByRef(userid: string, serial: string): Promise<any> {
    return this.voucherModel.findOne({ by: userid, serial: serial });
  }

  async recoverVoucher(id: string): Promise<any> {
    return this.voucherModel.findOne({ _id: id });
  }

  async recoverById(id: string): Promise<any> {
    return this.voucherModel.findOne({ id: id });
  }

  async decreaseAmount(id: string, amount: number): Promise<any> {
    console.log(amount);
    return this.voucherModel.findOneAndUpdate({ _id: id }, { $inc: { amount: -amount } });
  }

  async calc(userid: string): Promise<any> {
    const today = todayRange();
    return this.voucherModel.find({
      $and: [
        { by: userid },
        {
          createdAt: {
            $gte: today.start,
            $lte: today.end,
          },
        },
      ],
    });
  }

  async report(userid: string, date: number): Promise<any> {
    const today = dateRange(date * 1000);
    console.log(today, 'today');
    return this.voucherModel.find({
      $and: [
        { by: userid },
        {
          createdAt: {
            $gte: today.start,
            $lte: today.end,
          },
        },
      ],
    });
  }
  async logout(userid): Promise<any> {
    const today = todayRange();
    const ObjId = Types.ObjectId;
    return this.voucherModel.aggregate([
      {
        $match: {
          $and: [
            {
              createdAt: {
                $gte: new Date(today.start),
                $lte: new Date(today.end),
              },
            },
            {
              by: ObjId(userid),
            },
          ],
        },
      },
      {
        $project: {
          cash: { $cond: { if: { $eq: ['$type', 1] }, then: '$amount', else: 0 } },
          card: { $cond: { if: { $eq: ['$type', 2] }, then: '$amount', else: 0 } },
        },
      },
      {
        $group: {
          _id: null,
          cash: { $sum: '$cash' },
          card: { $sum: '$card' },
        },
      },
    ]);
  }

  async getInfoById(id: string): Promise<any> {
    return this.voucherModel.findOne({ _id: id });
  }

  async getInfoByVoucherId(id: string): Promise<any> {
    return this.voucherModel.findOne({ _id: id });
  }

  async getInfoByData(data): Promise<any> {
    return this.voucherModel.findOne({ data: data });
  }

  async addQuery(id: string, query: any): Promise<any> {
    return this.voucherModel.findOneAndUpdate({ _id: id }, query);
  }
}
