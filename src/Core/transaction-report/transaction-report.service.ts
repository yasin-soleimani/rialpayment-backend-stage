import { Inject, Injectable } from '@vision/common';

@Injectable()
export class TransactionReportCoreService {
  constructor(@Inject('TransactionReportModel') private readonly reportModel: any) {}

  async getTotal(start, end, cards, terminals, merchant): Promise<any> {
    return this.reportModel.aggregate([
      {
        $match: {
          cardno: { $in: cards },
          merchant: { $in: merchant },
          terminal: { $in: terminals },
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$terminal',
          count: { $sum: 1 },
          total: { $sum: '$total' },
          organization: { $sum: '$organization' },
          discount: { $sum: '$discount' },
          wallet: { $sum: '$wallet' },
          balanceinstore: { $sum: '$bis' },
        },
      },
      {
        $lookup: {
          from: 'merchantterminals',
          localField: 'terminal',
          foreignField: 'terminalid',
          as: 'terminalInfo',
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

  async getPaginate(start, end, cards, terminals, merchant, page): Promise<any> {
    return this.reportModel.paginate(
      {
        cardno: { $in: cards },
        merchant: { $in: merchant },
        terminal: { $in: terminals },
        date: { $gte: start, $lte: end },
      },
      { page, sort: { date: -1 }, limit: 50 }
    );
  }

  async getAllExcel(start, end, cards, terminals, merchant): Promise<any> {
    return this.reportModel.find({
      cardno: { $in: cards },
      merchant: { $in: merchant },
      terminal: { $in: terminals },
      date: { $gte: start, $lte: end },
    });
  }
}
