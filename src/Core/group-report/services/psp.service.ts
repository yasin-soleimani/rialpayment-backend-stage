import { Inject, Injectable, successOptWithPagination } from '@vision/common';
import { Types } from 'mongoose';

@Injectable()
export class GroupReportPspCoreService {
  constructor(
    @Inject('PspVerifyModel') private readonly posModel: any,
    @Inject('PspRequestModel') private readonly requestModel: any
  ) {}

  async getTotal(cards, users, terminals, merchant, from, to) {
    return this.requestModel.aggregate([
      {
        $match: {
          CardNum: { $in: cards },
          Merchant: { $in: merchant },
          TermID: { $in: terminals },
          createdAt: { $gte: from, $lte: to },
        },
      },
      {
        $lookup: {
          from: 'pspverifies',
          localField: '_id',
          foreignField: 'request',
          as: 'verify',
        },
      },
      {
        $unwind: {
          path: '$verify',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: 'pspdiscounts',
          localField: 'verify.discount',
          foreignField: '_id',
          as: 'discounts',
        },
      },
      {
        $unwind: {
          path: '$discounts',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          TermID: 1,
          TrnAmt: 1,
          discounts: 1,
          wallet: {
            $cond: {
              if: {
                $and: [
                  { $gte: ['$discounts.storeinbalance', '$discounts.amount'] },
                  { $eq: ['$discounts.discount', 0] },
                ],
              },
              then: 0,
              else: {
                $subtract: [
                  { $subtract: [{ $add: ['$discounts.amount', '$discounts.discount'] }, '$discounts.organization'] },
                  '$discounts.storeinbalance',
                ],
              },
            },
          },
          balanceinstore: {
            $cond: {
              if: { $and: [{ $gte: ['$discounts.storeinbalance', '$discounts.amount'] }] },
              then: '$discounts.amount',
              else: '$discounts.storeinbalance',
            },
          },
        },
      },
      {
        $group: {
          _id: '$TermID',
          count: { $sum: 1 },
          total: { $sum: '$TrnAmt' },
          organization: { $sum: '$discounts.organization' },
          discount: { $sum: '$discounts.discount' },
          wallet: { $sum: '$discounts.wallet' },
          balanceinstore: { $sum: '$balanceinstore' },
        },
      },
      {
        $lookup: {
          from: 'merchantterminals',
          localField: 'TermID',
          foreignField: 'terminalid',
          as: 'terminalInfo',
        },
      },
      {
        $unwind: {
          path: '$terminalInfo',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 1,
          count: 1,
          total: 1,
          organization: 1,
          discount: 1,
          wallet: 1,
          balanceinstore: 1,
          terminaltitle: '$terminalInfo.title',
        },
      },
    ]);
  }

  async getTotalPaginate(cards, users, terminals, merchant, from, to, page: number): Promise<any> {
    let aggregate = this.requestModel.aggregate();
    let ObjID = Types.ObjectId;

    aggregate.match({
      CardNum: { $in: cards },
      Merchant: { $in: merchant },
      TermID: { $in: terminals },
      createdAt: { $gte: from, $lte: to },
    });

    aggregate.lookup({
      from: 'pspverifies',
      localField: '_id',
      foreignField: 'request',
      as: 'verify',
    });

    aggregate.lookup({
      from: 'pspdiscounts',
      localField: 'verify.discount',
      foreignField: '_id',
      as: 'discounts',
    });

    aggregate.unwind({
      path: '$verify',
      preserveNullAndEmptyArrays: false,
    });
    aggregate.unwind({
      path: '$discounts',
      preserveNullAndEmptyArrays: false,
    });

    aggregate.project({
      terminalid: '$TermID',
      cardno: '$CardNum',
      total: '$TrnAmt',
      organization: '$discounts.organization',
      discount: '$discounts.discount',
      wallet: {
        $cond: {
          if: {
            $and: [{ $gte: ['$discounts.storeinbalance', '$discounts.amount'] }, { $eq: ['$discounts.discount', 0] }],
          },
          then: 0,
          else: {
            $subtract: [
              { $subtract: [{ $add: ['$discounts.amount', '$discounts.discount'] }, '$discounts.organization'] },
              '$discounts.storeinbalance',
            ],
          },
        },
      },
      balanceinstore: {
        $cond: {
          if: { $and: [{ $gte: ['$discounts.storeinbalance', '$discounts.amount'] }] },
          then: '$discounts.amount',
          else: '$discounts.storeinbalance',
        },
      },
      createdAt: '$createdAt',
    });

    var options = { page: page, limit: 50 };
    return this.requestModel.aggregatePaginate(aggregate, options);
  }

  async getAll(cards, users, terminals, merchant, from, to): Promise<any> {
    let aggregate = this.requestModel.aggregate();
    let ObjID = Types.ObjectId;

    if (cards != null)
      aggregate.match({
        CardNum: { $in: cards },
        Merchant: { $in: merchant },
        TermID: { $in: terminals },
        createdAt: { $gte: from, $lte: to },
      });
    else
      aggregate.match({
        Merchant: { $in: merchant },
        TermID: { $in: terminals },
        createdAt: { $gte: from, $lte: to },
      });

    aggregate.lookup({
      from: 'pspverifies',
      localField: '_id',
      foreignField: 'request',
      as: 'verify',
    });

    aggregate.lookup({
      from: 'pspdiscounts',
      localField: 'verify.discount',
      foreignField: '_id',
      as: 'discounts',
    });

    aggregate.unwind({
      path: '$verify',
      preserveNullAndEmptyArrays: false,
    });
    aggregate.unwind({
      path: '$discounts',
      preserveNullAndEmptyArrays: false,
    });

    aggregate.lookup({
      from: 'cards',
      localField: 'CardNum',
      foreignField: 'cardno',
      as: 'card',
    });
    aggregate.unwind({
      path: '$card',
      preserveNullAndEmptyArrays: true,
    });
    aggregate.lookup({
      from: 'users',
      localField: 'card.user',
      foreignField: '_id',
      as: 'user',
    });
    aggregate.unwind({
      path: '$user',
      preserveNullAndEmptyArrays: true,
    });

    aggregate.project({
      terminalid: '$TermID',
      cardno: '$CardNum',
      total: '$TrnAmt',
      user: '$user',
      organization: '$discounts.organization',
      discount: '$discounts.discount',
      wallet: {
        $cond: {
          if: {
            $and: [{ $gte: ['$discounts.storeinbalance', '$discounts.amount'] }, { $eq: ['$discounts.discount', 0] }],
          },
          then: 0,
          else: {
            $subtract: [
              { $subtract: [{ $add: ['$discounts.amount', '$discounts.discount'] }, '$discounts.organization'] },
              '$discounts.storeinbalance',
            ],
          },
        },
      },
      balanceinstore: {
        $cond: {
          if: { $and: [{ $gte: ['$discounts.storeinbalance', '$discounts.amount'] }] },
          then: '$discounts.amount',
          else: '$discounts.storeinbalance',
        },
      },
      createdAt: '$createdAt',
    });

    return aggregate;
  }

  async getAllDirectPaginate(merchantTitle, cards, users, terminals, merchant, from, to, page): Promise<any> {
    let aggregate = this.requestModel.aggregate();
    let ObjID = Types.ObjectId;
    // result data yasin!
    aggregate.match({
      CardNum: { $in: cards },
      Merchant: { $in: merchant },
      TermID: { $in: terminals },
      createdAt: { $gte: from, $lte: to },
    });

    aggregate.lookup({
      from: 'pspverifies',
      localField: '_id',
      foreignField: 'request',
      as: 'verify',
    });

    aggregate.lookup({
      from: 'pspdiscounts',
      localField: 'verify.discount',
      foreignField: '_id',
      as: 'discounts',
    });

    aggregate.unwind({
      path: '$verify',
      preserveNullAndEmptyArrays: false,
    });
    aggregate.unwind({
      path: '$discounts',
      preserveNullAndEmptyArrays: false,
    });

    aggregate.project({
      merchantTitle: merchantTitle,
      terminalid: '$TermID',
      cardno: '$CardNum',
      total: '$TrnAmt',
      organization: '$discounts.organization',
      discount: '$discounts.discount',
      wallet: {
        $cond: {
          if: {
            $and: [{ $gte: ['$discounts.storeinbalance', '$discounts.amount'] }, { $eq: ['$discounts.discount', 0] }],
          },
          then: 0,
          else: {
            $subtract: [
              { $subtract: [{ $add: ['$discounts.amount', '$discounts.discount'] }, '$discounts.organization'] },
              '$discounts.storeinbalance',
            ],
          },
        },
      },
      balanceinstore: {
        $cond: {
          if: { $and: [{ $gte: ['$discounts.storeinbalance', '$discounts.amount'] }] },
          then: '$discounts.amount',
          else: '$discounts.storeinbalance',
        },
      },
      createdAt: '$createdAt',
    });

    return this.requestModel.aggregatePaginate(aggregate, { page, limit: 25 });
  }
}
