import { Inject, Injectable } from '@vision/common';

@Injectable()
export class PspVerifyCoreInvoiceService {
  constructor(@Inject('PspVerifyModel') private readonly posModel: any) {}

  async getReport(from, to): Promise<any> {
    let aggregate = this.posModel.aggregate();

    aggregate.match({
      confirm: true,
      discount: { $exists: true },
      createdAt: {
        $gte: from,
        $lte: to,
      },
    });
    aggregate.lookup({
      from: 'merchantterminals',
      localField: 'terminal',
      foreignField: '_id',
      as: 'terminals',
    });
    aggregate.unwind({
      path: '$terminals',
      preserveNullAndEmptyArrays: false,
    });
    aggregate.lookup({
      from: 'users',
      localField: 'terminals.user',
      foreignField: '_id',
      as: 'useri',
    });
    aggregate.unwind({
      path: '$useri',
      preserveNullAndEmptyArrays: false,
    });
    aggregate.lookup({
      from: 'pspdiscounts',
      localField: 'discount',
      foreignField: '_id',
      as: 'discounti',
    });
    aggregate.unwind({
      path: '$discounti',
      preserveNullAndEmptyArrays: false,
    });
    aggregate.group({
      _id: {
        terminalid: '$terminals.terminalid',
        fullname: '$useri.fullname',
        mobile: '$useri.mobile',
        address: '$useri.address',
        place: '$useri.place',
        nationalcode: '$useri.nationalcode',
        title: '$terminals.title',
      },
      total: { $sum: { $add: ['$discounti.discount', '$discounti.amount', '$discounti.storeinbalance'] } },
      wage: { $sum: { $add: ['$discounti.companywage', '$discounti.cardref', '$discounti.merchantref'] } },
      amount: { $sum: { $add: ['$discounti.amount', '$discounti.bankdisc', '$discounti.nonebank'] } },
      agentwage: { $sum: { $add: ['$discounti.cardref', '$discounti.merchantref'] } },
      companywage: { $sum: '$discounti.companywage' },
      count: { $sum: 1 },
    });
    return aggregate;
  }
}
