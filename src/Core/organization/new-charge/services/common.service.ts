import { Inject, Injectable } from '@vision/common';
import { promises } from 'fs';
import { Types } from 'mongoose';

@Injectable()
export class OrganizationNewChargeCoreCommonService {
  constructor(@Inject('OrganizationNewChargeModel') private readonly chargeModel: any) { }

  async getListByQuery(query: any, page: number): Promise<any> {
    return this.chargeModel.paginate(query, { page: page, sort: { createdAt: -1 }, limit: 50 });
  }

  async charge(
    from: string,
    user: string,
    card: string,
    input: number,
    out: number,
    remain: number,
    desc: string,
    poolId: string
  ): Promise<any> {
    return this.chargeModel.create({
      from,
      user,
      card,
      in: input,
      out,
      remain,
      description: desc,
      pool: poolId
    });
  }

  async getLastByQuery(query): Promise<any> {
    return this.chargeModel.findOne(query).sort({ createdAt: -1 });
  }

  async updateByIdAndQuery(id: string, query: any): Promise<any> {
    return this.chargeModel.findOneAndUpdate({ _id: id }, query);
  }

  async getPoolsByUserId(userId: string): Promise<any> {
    let ObjId = Types.ObjectId;

    return this.chargeModel.aggregate([
      { $match: { user: ObjId(userId) } },
      {
        $group: {
          _id: '$pool',
        }
      },
      {
        $project: {
          userId: userId
        },
      }, {
        $lookup: {
          from: 'organizationpools',
          localField: '_id',
          foreignField: '_id',
          as: 'pool',
        },
      }
    ])
  }

  async getPoolsByCardId(cardId: string): Promise<any> {
    let ObjId = Types.ObjectId;

    return this.chargeModel.aggregate([
      { $match: { card: ObjId(cardId) } },
      {
        $group: {
          _id: '$pool',
        }
      },
      {
        $project: {
          cardId: cardId
        }
      }
    ])
  }

  // async update 
}
