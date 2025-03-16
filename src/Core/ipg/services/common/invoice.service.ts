import { Inject, Injectable } from '@vision/common';

@Injectable()
export class IpgCoreInvoiceService {
  constructor(@Inject('IpgModel') private readonly ipgModel: any) {}

  async getReport(from, to): Promise<any> {
    let aggregate = this.ipgModel.aggregate();

    aggregate.match({
      createdAt: {
        $gte: from,
        $lte: to,
      },
      $or: [{ paytype: 1 }, { paytype: 2 }],
      userinvoice: { $regex: new RegExp('Ipg-+') },
      'details.respcode': 0,
    });

    aggregate.lookup({
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'useri',
    });
    aggregate.lookup({
      from: 'mipgs',
      localField: 'terminalid',
      foreignField: 'terminalid',
      as: 'mipg',
    });
    aggregate.unwind({
      path: '$useri',
      preserveNullAndEmptyArrays: false,
    });
    aggregate.unwind({
      path: '$mipg',
      preserveNullAndEmptyArrays: false,
    });
    aggregate.group({
      _id: {
        terminalid: '$terminalid',
        fullname: '$useri.fullname',
        mobile: '$useri.mobile',
        address: '$useri.address',
        place: '$useri.place',
        nationalcode: '$useri.nationalcode',
        title: '$mipg.title',
        wagetype: '$paytype',
        wage: '$karmozd',
      },
      total: { $sum: '$total' },
      amount: { $sum: '$amount' },
      wage: { $sum: '$discount' },
      count: { $sum: 1 },
    });

    return aggregate;
  }
}
