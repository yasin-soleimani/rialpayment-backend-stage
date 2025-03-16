import { Injectable, Inject } from '@vision/common';

@Injectable()
export class CardChargeHistoryCoreService {
  constructor(@Inject('CardChargeHistoryModel') private readonly historyModel: any) {}

  async addNew(
    user: string,
    card: string,
    amount: number,
    description: string,
    type: number,
    cardno: number
  ): Promise<any> {
    return this.historyModel.create({
      user,
      card,
      amount,
      description,
      cardno,
      type,
    });
  }

  async getList(card: string, page: number): Promise<any> {
    return this.historyModel.paginate({ card }, { page, limit: 50 });
  }

  async changeCardHistoryToNewCard(OldCardId, NewCardId) {
    return this.historyModel.updateMany({ card: OldCardId }, { card: NewCardId });
  }

  async getCharges(cards: any, type: number): Promise<any> {
    return this.historyModel.aggregate([
      {
        $match: {
          cardno: { $in: cards },
          type,
        },
      },
      {
        $group: {
          _id: null,
          amount: { $sum: '$amount' },
        },
      },
    ]);
  }

  async getChargesByGroups(cards: any, type: number): Promise<any> {
    return this.historyModel.aggregate([
      {
        $match: {
          cardno: { $in: cards },
          type,
        },
      },
      {
        $lookup: {
          from: 'cards',
          localField: 'cardno',
          foreignField: 'cardno',
          as: 'cardI',
        },
      },
      {
        $group: {
          _id: '$cardI.group',
          amount: { $sum: '$amount' },
        },
      },
    ]);
  }

  async getReport(cards: any[], type: number, start: any, end: any): Promise<any> {
    return this.historyModel
      .find({ cardno: { $in: cards }, type, createdAt: { $gte: start, $lte: end } })
      .populate({ path: 'card', populate: { path: 'user' } });
  }

  async getReportPaginate(page: number, cards: [], type: number, start: any, end: any): Promise<any> {
    return this.historyModel.paginate(
      { cardno: { $in: cards }, type, createdAt: { $gte: start, $lte: end } },
      { page, sort: { createdAt: -1 }, populate: { path: 'card', populate: { path: 'user' } }, limit: 50 }
    );
  }
}
