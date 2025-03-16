import { Injectable, Inject } from '@vision/common';

@Injectable()
export class PspVrifyRequestCoreService {
  constructor(@Inject('PspRequestModel') private readonly requestModel: any) {}

  async getListByCardNum(cardno, page: number): Promise<any> {
    return this.requestModel.paginate(
      {
        CardNum: cardno,
      },
      { page, sort: { createdAt: -1 }, limit: 50 }
    );
  }

  async updateAmount(): Promise<any> {
    const data = await this.requestModel.find({ CommandID: 104 });
    for (const info of data) {
      const json = JSON.parse(info.req);
      console.log(json.TrnAmt, 'at');
      this.requestModel
        .findOneAndUpdate(
          {
            _id: info._id,
          },
          {
            $set: { TrnAmt: json.TrnAmt },
          }
        )
        .then((res) => console.log(res, 'res'));
    }
  }

  async getMinAndMax(cards, from, to): Promise<any> {
    let aggregate = this.requestModel.aggregate();

    aggregate.match({
      CardNum: { $in: cards },
      createdAt: {
        $gte: from,
        $lte: to,
      },
    });
    aggregate.lookup({
      from: 'pspverifies',
      localField: '_id',
      foreignField: 'request',
      as: 'verify',
    });
    aggregate.unwind({
      path: '$verify',
      preserveNullAndEmptyArrays: false,
    });

    aggregate.match({
      'verify.confirm': true,
    });
    aggregate.lookup({
      from: 'pspdiscounts',
      localField: 'verify.discount',
      foreignField: '_id',
      as: 'discounts',
    });
    aggregate.unwind({
      path: '$discounts',
      preserveNullAndEmptyArrays: false,
    });
    aggregate.group({
      _id: {
        merchant: '$Merchant',
        year: {
          $year: '$createdAt',
        },
        month: {
          $month: '$createdAt',
        },
        day: {
          $dayOfMonth: '$createdAt',
        },
      },
      count: { $sum: 1 },
      amount: { $sum: '$TrnAmt' },
      organization: { $sum: '$discounts.organization' },
    });
    aggregate.lookup({
      from: 'merchants',
      localField: '_id.merchant',
      foreignField: 'merchantcode',
      as: 'minfo',
    });
    aggregate.addFields({
      title: { $arrayElemAt: ['$minfo.title', 0] },
      merchantcode: '$_id.merchant',
      amount: '$amount',
      count: '$count',
      organization: '$organization',
    });
    aggregate.project({
      title: 1,
      count: 1,
      organization: 1,
      merchantcode: 1,
      amount: 1,
      _id: 1,
    });
    aggregate.sort({ count: 1 });
    return aggregate;
  }

  async getAllCalc(cards: any): Promise<any> {
    let aggregate = this.requestModel.aggregate();

    aggregate.match({
      CardNum: { $in: cards },
    });
    aggregate.lookup({
      from: 'pspverifies',
      localField: '_id',
      foreignField: 'request',
      as: 'verify',
    });
    aggregate.unwind({
      path: '$verify',
      preserveNullAndEmptyArrays: false,
    });
    aggregate.match({
      'verify.confirm': true,
    });
    aggregate.group({
      _id: {
        merchant: '$Merchant',
        year: {
          $year: '$createdAt',
        },
        month: {
          $month: '$createdAt',
        },
        day: {
          $dayOfMonth: '$createdAt',
        },
      },
      count: { $sum: 1 },
      amount: { $sum: '$TrnAmt' },
    });
    aggregate.lookup({
      from: 'merchants',
      localField: '_id.merchant',
      foreignField: 'merchantcode',
      as: 'minfo',
    });
    aggregate.addFields({
      title: { $arrayElemAt: ['$minfo.title', 0] },
      merchantcode: '$_id.merchant',
      amount: '$amount',
      count: '$count',
    });
    aggregate.project({
      title: 1,
      count: 1,
      merchantcode: 1,
      amount: 1,
      _id: 1,
    });
    aggregate.sort({ count: 1 });
    return aggregate;
  }

  async getGroupCardInfo(cards, from, to): Promise<any> {
    let aggregate = this.requestModel.aggregate();

    aggregate.match({
      CardNum: { $in: cards },
      createdAt: {
        $gte: from,
        $lte: to,
      },
    });
    aggregate.lookup({
      from: 'pspverifies',
      localField: '_id',
      foreignField: 'request',
      as: 'verify',
    });
    aggregate.unwind({
      path: '$verify',
      preserveNullAndEmptyArrays: false,
    });
    aggregate.lookup({
      from: 'pspdiscounts',
      localField: 'verify.discount',
      foreignField: '_id',
      as: 'discounts',
    });
    aggregate.unwind({
      path: '$discounts',
      preserveNullAndEmptyArrays: false,
    });
    aggregate.group({
      _id: {
        merchant: '$Merchant',
        termtype: '$TermType',
        confirm: '$verify.confirm',
      },
      count: { $sum: 1 },
      amount: { $sum: '$TrnAmt' },
      organization: { $sum: '$discounts.organization' },
    });
    aggregate.lookup({
      from: 'merchants',
      localField: '_id.merchant',
      foreignField: 'merchantcode',
      as: 'minfo',
    });
    aggregate.addFields({
      title: { $arrayElemAt: ['$minfo.title', 0] },
      merchantcode: '$_id.merchant',
      confirm: '$_id.confirm',
      type: '$_id.termtype',
      amount: '$amount',
      organization: '$organization',
    });
    aggregate.project({
      title: 1,
      count: 1,
      merchantcode: 1,
      type: 1,
      organization: 1,
      amount: 1,
      confirm: 1,
      _id: 0,
    });
    return aggregate;
  }

  async getGroupCardInfoAll(cards): Promise<any> {
    let aggregate = this.requestModel.aggregate();

    aggregate.match({
      CardNum: { $in: cards },
    });
    aggregate.lookup({
      from: 'pspverifies',
      localField: '_id',
      foreignField: 'request',
      as: 'verify',
    });
    aggregate.unwind({
      path: '$verify',
      preserveNullAndEmptyArrays: false,
    });
    // aggregate.match({
    //   'verify.confirm' : true
    // })
    aggregate.group({
      _id: {
        merchant: '$Merchant',
        termtype: '$TermType',
        confirm: '$verify.confirm',
      },
      count: { $sum: 1 },
      amount: { $sum: '$TrnAmt' },
    });
    aggregate.lookup({
      from: 'merchants',
      localField: '_id.merchant',
      foreignField: 'merchantcode',
      as: 'minfo',
    });
    aggregate.addFields({
      title: { $arrayElemAt: ['$minfo.title', 0] },
      merchantcode: '$_id.merchant',
      confirm: '$_id.confirm',
      type: '$_id.termtype',
      amount: '$amount',
    });
    aggregate.project({
      title: 1,
      count: 1,
      merchantcode: 1,
      type: 1,
      amount: 1,
      confirm: 1,
      _id: 0,
    });
    return aggregate;
  }

  async getBalances(merchants): Promise<any> {
    let aggregate = this.requestModel.aggregate();
    aggregate.match({ Merchant: { $in: merchants } });
    aggregate.lookup({
      from: 'pspverifies',
      localField: '_id',
      foreignField: 'request',
      as: 'verify',
    });
    aggregate.unwind({
      path: '$verify',
      preserveNullAndEmptyArrays: false,
    });
    aggregate.match({ 'verify.confirm': true });
    aggregate.group({
      _id: {
        merchant: '$Merchant',
      },
      count: { $sum: 1 },
      amount: { $sum: '$TrnAmt' },
    });
    aggregate.lookup({
      from: 'merchants',
      localField: '_id.merchant',
      foreignField: 'merchantcode',
      as: 'minfo',
    });
    aggregate.addFields({
      title: { $arrayElemAt: ['$minfo.title', 0] },
      merchantcode: '$_id.merchant',
      confirm: '$_id.confirm',
      type: '$_id.termtype',
      amount: '$amount',
    });
    aggregate.project({
      title: 1,
      count: 1,
      merchantcode: 1,
      type: 1,
      amount: 1,
      confirm: 1,
      _id: 0,
    });
    return aggregate;
  }
}
