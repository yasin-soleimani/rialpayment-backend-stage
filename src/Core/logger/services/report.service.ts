import { Inject, Injectable } from '@vision/common';

@Injectable()
export class LoggerCoreReportService {
  constructor(@Inject('LoggerModel') private readonly loggerModel: any) {}

  async getInvoiceData(query: any): Promise<any> {
    let aggregate = this.loggerModel.aggregate();

    aggregate.match(query);
    aggregate.lookup({
      from: 'users',
      localField: 'from',
      foreignField: '_id',
      as: 'useri',
    });
    aggregate.unwind({
      path: '$useri',
      preserveNullAndEmptyArrays: false,
    });
    aggregate.group({
      _id: {
        fullname: '$useri.fullname',
        mobile: '$useri.mobile',
        address: '$useri.address',
        place: '$useri.place',
        nationalcode: '$useri.nationalcode',
      },
      total: { $sum: '$amount' },
      wage: { $sum: '$amount' },
      amount: { $sum: '$amount' },
      companywage: { $sum: '$amount' },
      agentwage: { $sum: 0 },
      count: { $sum: 1 },
    });

    return aggregate;
  }
}
