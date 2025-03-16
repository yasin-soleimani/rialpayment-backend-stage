import { Injectable, Inject } from '@vision/common';
import { Types } from 'mongoose';

@Injectable()
export class AccountBlockService {
  constructor(@Inject('AccountBlockModel') private readonly blockModel: any) {}

  async add(userid: string, description: string, amount: number, type: string): Promise<any> {
    return this.blockModel.create({
      user: userid,
      amount: amount,
      type: type,
      description: description,
    });
  }

  async changeStatus(id: string, status: boolean): Promise<any> {
    return this.blockModel.findOneAndUpdate(
      {
        _id: id,
      },
      {
        status: status,
      }
    );
  }

  async getList(userid: string, page: number): Promise<any> {
    return this.blockModel.paginate({ user: userid, status: true }, { page: page, sort: { createdAt: -1 }, limit: 50 });
  }

  async getFilter(query, page): Promise<any> {
    let aggregate = this.blockModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userx',
        },
      },
      {
        $addFields: {
          mob: {
            $toString: {
              $toLong: { $arrayElemAt: ['$userx.mobile', 0] },
            },
          },
        },
      },
      {
        $match: query,
      },
    ]);

    var options = { page: page, limit: 50 };
    return this.blockModel.aggregatePaginate(aggregate, options);
  }

  async getBlock(userid: string): Promise<any> {
    let ObjId = Types.ObjectId;
    return this.blockModel.aggregate([
      {
        $match: {
          user: ObjId(userid),
          status: true,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);
  }
}
