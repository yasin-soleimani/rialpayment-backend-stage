import { Inject, Injectable } from '@vision/common';
import { Types } from 'mongoose';
import { RemoveDuplicateTerminalsTurnOver } from '../function/common.func';

@Injectable()
export class TurnoverCommonCoreService {
  constructor(@Inject('TurnoverModel') private readonly turnoverModel: any) {}

  async submitNew(
    type: string,
    terminal: string,
    user: string,
    card: string,
    inx: number,
    out: number,
    remain: number,
    description: string,
    ref: string
  ): Promise<any> {
    return this.turnoverModel.create({ type, terminal, user, card, in: inx, out, remain, description, ref });
  }

  async submitNewLeCredit(
    type: string,
    terminal: string,
    user: string,
    card: string,
    inx: number,
    out: number,
    remain: number,
    description: string,
    ref: string,
    leasing: string,
    leasingApply: string
  ): Promise<any> {
    return this.turnoverModel.create({
      type,
      terminal,
      user,
      card,
      in: inx,
      out,
      remain,
      description,
      ref,
      leasing,
      leasingApply,
    });
  }

  async getLastByQuery(query): Promise<any> {
    return this.turnoverModel.findOne(query).sort({ _id: -1 });
  }

  async updateByIdAndQuery(id: string, query: any): Promise<any> {
    return this.turnoverModel.findOneAndUpdate({ _id: id }, query);
  }

  async getTerminalsByUSerId(terminals, userId): Promise<any> {
    let tmpArray = Array();

    for (const item of terminals) {
      const data = await this.getLastByQuery({ user: userId, terminals: item });
      if (data) tmpArray.concat(data.terminals);
    }

    return RemoveDuplicateTerminalsTurnOver(terminals, tmpArray);
  }

  async getTerminalsByCardId(terminals, cardId): Promise<any> {
    let tmpArray = Array();

    for (const item of terminals) {
      const data = await this.getLastByQuery({ card: cardId, terminals: item });
      if (data) tmpArray.concat(data.terminals);
    }
    return RemoveDuplicateTerminalsTurnOver(terminals, tmpArray);
  }

  async getListUser(query, page: number): Promise<any> {
    return this.turnoverModel.paginate(query, { page, sort: { createdAt: -1 }, limit: 50 });
  }

  async getListUsersTerminal(userId: string, page: number): Promise<any> {
    let aggregate = this.turnoverModel.aggregate();
    let ObjID = Types.ObjectId;

    aggregate.match({ user: ObjID(userId) });
    aggregate.group({
      _id: '$terminal',
    });

    aggregate.lookup({
      from: 'merchantterminals',
      localField: '_id',
      foreignField: '_id',
      as: 'terminalInfo',
    });

    aggregate.addFields({
      terminalid: { $arrayElemAt: ['$terminalInfo.terminalid', 0] },
      title: { $arrayElemAt: ['$terminalInfo.title', 0] },
    });

    aggregate.project({
      terminalid: 1,
      title: 1,
    });
    var options = { page: page, limit: 50 };

    return this.turnoverModel.aggregatePaginate(aggregate, options);
  }
}
