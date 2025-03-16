import { Inject, Injectable } from '@vision/common';
import { Model, Types } from 'mongoose';

@Injectable()
export class MerchantCoreTerminalBalanceService {
  constructor(@Inject('TerminalBalanceModel') private readonly terminalBalanceModel: any) {}

  async getBalanceInStore(terminalid, userid): Promise<any> {
    let ObjID = Types.ObjectId;
    return this.terminalBalanceModel.aggregate([
      {
        $match: {
          terminal: ObjID(terminalid),
          user: ObjID(userid),
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

  async getBalanceInTerminalsStore(terminals, userId: string): Promise<any> {
    let ObjID = Types.ObjectId;

    return this.terminalBalanceModel.aggregate([
      {
        $match: {
          terminal: { $in: terminals },
          user: ObjID(userId),
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

  async getTerminalsByUserId(userid: string): Promise<any> {
    let ObjID = Types.ObjectId;
    return this.terminalBalanceModel.aggregate([
      {
        $match: {
          user: ObjID(userid),
        },
      },
      {
        $unwind: {
          path: '$terminal',
        },
      },
      {
        $group: {
          _id: null,
          terminals: { $addToSet: '$terminal' },
        },
      },
    ]);
  }

  async getTerminalsByUserIdBalances(userid: string): Promise<any> {
    let ObjID = Types.ObjectId;
    return this.terminalBalanceModel.aggregate([
      {
        $match: {
          user: ObjID(userid),
        },
      },
      {
        $unwind: {
          path: '$terminal',
        },
      },
      {
        $group: {
          _id: null,
          terminals: { $addToSet: '$terminal' },
        },
      },
    ]);
  }

  async getBalanceInStoreWithCard(terminalid, cardid): Promise<any> {
    let ObjID = Types.ObjectId;
    return this.terminalBalanceModel.aggregate([
      {
        $match: {
          terminal: ObjID(terminalid),
          card: ObjID(cardid),
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

  async getBalanceInStoreTerminalWithCard(terminals, cardid): Promise<any> {
    let ObjID = Types.ObjectId;
    return this.terminalBalanceModel.aggregate([
      {
        $match: {
          terminal: { $in: terminals },
          card: ObjID(cardid),
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
  async getTerminalsByCardId(cardid: string): Promise<any> {
    let ObjID = Types.ObjectId;
    return this.terminalBalanceModel.aggregate([
      {
        $match: {
          card: ObjID(cardid),
        },
      },
      {
        $unwind: {
          path: '$terminal',
        },
      },
    ]);
  }

  async getBalanceWithCard(cardid): Promise<any> {
    return this.terminalBalanceModel.findOne({
      card: cardid,
    });
  }

  async ccCard(query): Promise<any> {
    return this.terminalBalanceModel.create(query);
  }

  async addToTerminalBalance(terminalid, userid, amount): Promise<any> {
    const data = await this.terminalBalanceModel.findOne({ terminal: terminalid, user: userid });
    if (data) {
      return this.terminalBalanceModel.findOneAndUpdate(
        { user: userid, terminal: terminalid },
        { $inc: { amount: amount } }
      );
    } else {
      return this.terminalBalanceModel.create({ user: userid, terminal: terminalid, amount: amount });
    }
  }

  async dechargeStoreInBalnce(terminalid, userid, amount): Promise<any> {
    console.log('in decharges+++++++++++++++++++++++++++>>>>>>>>>>>>>>>>>>>');
    //const last = await this.terminalBalanceModel.findOne({ user: userid, terminal: terminalid }).sort({ _id: -1 });
    const last = await this.terminalBalanceModel.find({ user: userid, terminal: terminalid }).sort({ _id: -1 });
    let remain = amount;
    for (const item of last) {
      console.log('item-=-=-=-=-=->', item);
      const bAmount = item.amount;
      if (bAmount >= remain) {
        console.log('in enough');
        this.terminalBalanceModel.findOneAndUpdate({ _id: item._id }, { $inc: { amount: -remain } }).exec();
        remain = 0;
        break;
      } else {
        console.log('in lower');
        remain -= bAmount;
        this.terminalBalanceModel.findOneAndUpdate({ _id: item._id }, { $set: { amount: 0 } }).exec();
      }
    }
    console.log('remain::::::::::::>>>>>>>>>>>>>>>>> ', remain);
    if (remain == 0) return true;
    else return false;
    //return this.terminalBalanceModel.findOneAndUpdate({ _id: last._id }, { $inc: { amount: -amount } }).exec();
  }

  async dechargeStoreWithCard(terminalid, cardid, amount): Promise<any> {
    const last = await this.terminalBalanceModel.findOne({ card: cardid, terminal: terminalid }).sort({ _id: -1 });
    return this.terminalBalanceModel.findOneAndUpdate({ _id: last._id }, { $inc: { amount: -amount } }).exec();
  }

  async chargeBalanceInStore(
    terminals: string[],
    userid: string,
    amount: number,
    expire: any,
    daysofweek
  ): Promise<any> {
    return this.terminalBalanceModel.create({
      user: userid,
      terminal: terminals,
      amount: amount,
      expire: expire,
      daysofweek: daysofweek,
    });
  }

  async chargeBalanceinStoreWithCard(
    terminals: string[],
    cardid: string,
    amount: number,
    expire,
    daysofweek
  ): Promise<any> {
    return this.terminalBalanceModel.create({
      card: cardid,
      terminal: terminals,
      amount: amount,
      expire: expire,
      daysofweek: daysofweek,
    });
  }

  async bulkChangeCardUser(card, user) {
    return this.terminalBalanceModel.updateMany({ card }, { $set: { user }, $unset: { card: '' } });
  }

  async getBalanceFromCard(card) {
    return this.terminalBalanceModel.aggregate([
      { $match: { card: Types.ObjectId(card) } },
      { $group: { _id: null, amount: { $sum: '$amount' } } },
    ]);
  }

  async updateterminal(cardid, terminalid): Promise<any> {
    this.terminalBalanceModel.findOneAndUpdate({ card: cardid }, { terminal: { $push: { terminalid } } });
  }

  async updateterminalCardToUser(cardId, userid): Promise<any> {
    this.terminalBalanceModel.findOneAndUpdate({ card: cardId }, { $set: { user: userid } });
  }

  async aggregate(aggre): Promise<any> {
    return this.terminalBalanceModel.aggregate(aggre);
  }

  async getListByTerminals(id: string, terminals, page: number): Promise<any> {
    return this.terminalBalanceModel.paginate(
      { $and: [{ terminal: { $in: terminals } }, { $or: [{ user: id }, { card: id }] }] },
      { page: page, populate: 'terminal', sort: { createdAt: -1 }, limit: 50 }
    );
  }

  async getAllListByTerminals(id: string, terminals): Promise<any> {
    return this.terminalBalanceModel.find({
      $and: [{ terminal: { $in: terminals } }, { $or: [{ user: id }, { card: id }] }],
    });
  }
  async updateTerminalByIdPush(id: string, terminals): Promise<any> {
    return this.terminalBalanceModel.findOneAndUpdate({ _id: id }, { $push: { terminal: { $each: terminals } } });
  }
  async updateTerminalById(id: string, terminals): Promise<any> {
    return this.terminalBalanceModel.findOneAndUpdate({ _id: id }, { terminal: terminals });
  }
  // async getTerminalInfo(terminal: string): Promise<any> {
  //   return this.terminalBalanceModel.findOne({ _id: id }, { terminal: terminals });
  // }
}
