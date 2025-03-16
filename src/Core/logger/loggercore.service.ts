import { Model } from 'mongoose';
import { Injectable, Inject } from '@vision/common';
import { LoggercoreDto } from './dto/loggercore.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
// import { digitsFaToEn } from 'persian-tools';
import * as UniqueNumber from 'unique-number';
import * as momentjs from 'jalali-moment';

@Injectable()
export class LoggercoreService {
  constructor(@Inject('LoggerModel') private readonly loggerModel: any) {}

  async updateLogWithQueryAndId(id: string, query): Promise<any> {
    return this.loggerModel.findOneAndUpdate({ _id: id }, query);
  }

  async updateLogWithQueryAndRef(ref: string, query): Promise<any> {
    return this.loggerModel.findOneAndUpdate({ ref: ref }, query);
  }

  private async create(loggerDto: LoggercoreDto): Promise<any> {
    const newlogger = new this.loggerModel(loggerDto);
    return newlogger.save();
  }

  private async list(userid: string, page: number, type: string): Promise<any> {
    const query = await this.selectType(type, userid);
    return await this.loggerModel.paginate(query, { page, sort: { createdAt: -1 }, limit: 10 });
  }

  private async getAll(userid: string): Promise<any> {
    return this.loggerModel.find({ $or: [{ from: userid }, { to: userid }] });
  }

  private async searchList(userid: string, page: number, words: string, type: string): Promise<any> {
    // words = digitsFaToEn(words);
    const query = await this.searchSelectType(type, words, userid);
    return this.loggerModel.paginate(query, { page, sort: { createdAt: -1 }, limit: 10 });
  }

  async newLogg(loggerDto: LoggercoreDto): Promise<any> {
    return this.create(loggerDto);
  }

  async guestLog(title, invoiceid, amount, status, mobile): Promise<any> {
    return this.loggerModel.create({
      title: title,
      invoiceid: invoiceid,
      amount: amount,
      status: status,
      mobile: mobile,
    });
  }

  async getLastTen(userid): Promise<any> {
    return this.loggerModel
      .find({ $or: [{ from: userid }, { to: userid }] })
      .limit(10)
      .sort({ createdAt: -1 })
      .select({ title: 1, amount: 1, createdAt: 1, status: 1 });
  }

  async getListAll(userid: string): Promise<any> {
    if (isEmpty(userid)) throw new FillFieldsException();
    const data = await this.getAll(userid);
    let docs = Array();

    for (const info of data) {
      let status = 'ناموفق';
      if (info.status == 1 || info.status == true) {
        status = 'موفق';
      }
      if (info.to == userid) {
        docs.push({
          _id: info._id,
          ref: info.ref,
          title: info.title,
          in: info.amount,
          out: 0,
          amount: info.amount,
          status: status,
          mod: info.senderbalance || 0,
          date: momentjs(info.createdAt).locale('fa').format('YYYY/MM/DD HH:mm:ss'),
        });
      } else {
        docs.push({
          _id: info._id,
          ref: info.ref,
          title: info.title,
          in: 0,
          out: info.amount,
          amount: info.amount,
          status: info.status,
          mod: info.receivebalance || 0,
          date: momentjs(info.createdAt).locale('fa').format('YYYY/MM/DD HH:mm:ss'),
        });
      }
    }

    return docs;
  }

  async getList(userid: string, page: number, type: string): Promise<any> {
    if (isEmpty(userid)) throw new FillFieldsException();
    const data = await this.list(userid, page, type);
    let docs = Array();
    for (let i = 0; data.docs.length > i; i++) {
      if (data.docs[i].to == userid) {
        let status = false;
        if (data.docs[i].status == 1 || data.docs[i].status == true) {
          status = true;
        }
        docs.push({
          _id: data.docs[i]._id,
          ref: data.docs[i].ref,
          title: data.docs[i].title,
          in: data.docs[i].amount,
          out: 0,
          amount: data.docs[i].amount,
          status: status,
          mod: data.docs[i].senderbalance || 0,
          createdAt: data.docs[i].createdAt,
        });
      } else {
        let status = false;
        if (data.docs[i].status == 1 || data.docs[i].status == true) {
          status = true;
        }
        docs.push({
          _id: data.docs[i]._id,
          ref: data.docs[i].ref,
          title: data.docs[i].title,
          in: 0,
          out: data.docs[i].amount,
          amount: data.docs[i].amount,
          status: data.docs[i].status,
          mod: data.docs[i].receivebalance || 0,
          createdAt: data.docs[i].createdAt,
        });
      }
    }
    data.docs = docs;
    return data;
  }

  async findAndUpdate(invoiceid: string, statusx: boolean): Promise<any> {
    return this.loggerModel.findOneAndUpdate({ ref: invoiceid }, { status: statusx });
  }

  async findAndUpdateIPG(invoiceid: string, statusx: boolean, amountx: number): Promise<any> {
    return this.loggerModel.findOneAndUpdate({ ref: invoiceid }, { $set: { status: statusx, amount: amountx } });
  }

  async updateTraxIPG(invoiceid: string, statusx: boolean, amount: number): Promise<any> {
    return this.loggerModel.findOneAndUpdate({ ref: invoiceid }, { amount: amount, status: statusx });
  }

  async submitNewLogg(titlex, type, amount, status, from, to, tobalance?, senderBalance?, mobile?) {
    const title = titlex;
    const uniqueNumber = new UniqueNumber(true);
    const ref = type + '-' + uniqueNumber.generate();
    const log = this.setLogg(title, ref, amount, status, from, to, tobalance, senderBalance);
    return this.newLogg(log);
  }

  async submitNewLoggWithRef(titlex, ref, amount, status, from, to, tobalance?, senderBalance?, mobile?) {
    const title = titlex;
    const log = this.setLogg(title, ref, amount, status, from, to, tobalance, senderBalance);
    return this.newLogg(log);
  }

  async search(userid: string, pagex: number, words: string, type: string): Promise<any> {
    let page = 1;
    if (isEmpty(userid)) throw new FillFieldsException();
    if (!isEmpty(pagex)) {
      page = pagex;
    } else {
      page = 1;
    }
    const data = await this.searchList(userid, page, words, type);
    let docs = Array();
    for (let i = 0; data.docs.length > i; i++) {
      if (data.docs[i].to == userid) {
        let status = false;
        if (data.docs[i].status == 1 || data.docs[i].status == true) {
          status = true;
        }
        docs.push({
          _id: data.docs[i]._id,
          ref: data.docs[i].ref,
          title: data.docs[i].title,
          in: data.docs[i].amount,
          out: 0,
          amount: data.docs[i].amount,
          status: status,
          mod: data.docs[i].senderbalance || 0,
          createdAt: data.docs[i].createdAt,
        });
      } else {
        let status = false;
        if (data.docs[i].status == 1 || data.docs[i].status == true) {
          status = true;
        }
        docs.push({
          _id: data.docs[i]._id,
          ref: data.docs[i].ref,
          title: data.docs[i].title,
          in: 0,
          out: data.docs[i].amount,
          amount: data.docs[i].amount,
          status: data.docs[i].status,
          mod: data.docs[i].receivebalance || 0,
          createdAt: data.docs[i].createdAt,
        });
      }
    }
    data.docs = docs;
    return data;
  }

  setLogg(titlex, refx, amountx, statusx, fromid, toid, senderbalance?, receivebalance?, mobile?) {
    return {
      title: titlex,
      ref: refx,
      amount: amountx,
      status: statusx,
      from: fromid,
      to: toid,
      senderbalance: senderbalance,
      receivebalance: receivebalance,
      mobile: mobile,
    };
  }

  private async selectType(type, userid): Promise<any> {
    if (!isEmpty(type) || type === 'Ipg' || type === 'Charge' || type === 'Pay') {
      const query = { $and: [{ $or: [{ from: userid }, { to: userid }] }, { ref: { $regex: type + '.*' } }] };
      return query;
    } else {
      const query = { $or: [{ from: userid }, { to: userid }] };
      return query;
    }
  }

  private async searchSelectType(type, words, userid): Promise<any> {
    const where = '/^' + words + '/.test(this.terminalid)';
    if (!isEmpty(type) || type === 'Ipg' || type === 'Charge' || type === 'Pay') {
      const query = {
        $and: [
          { $or: [{ from: userid }, { to: userid }] },
          { $or: [{ $where: where }, { title: { $regex: words } }, { ref: { $regex: words } }] },
          { ref: { $regex: type + '.*' } },
        ],
      };
      return query;
    } else {
      const query = {
        $and: [
          { $or: [{ from: userid }, { to: userid }] },
          { $or: [{ $where: where }, { title: { $regex: words } }, { ref: { $regex: words } }] },
        ],
      };
      return query;
    }
  }

  async findAll(): Promise<any> {
    const data = await this.loggerModel.find({});
    return data;
  }

  async findByID(logid): Promise<any> {
    return this.loggerModel.findOne({ _id: logid });
  }

  async getFilter(query, page: number): Promise<any> {
    return this.loggerModel.paginate(query, { page, sort: { createdAt: -1 }, limit: 50 });
  }

  async getSuccessWebservice(limit: number): Promise<any> {
    return this.loggerModel.aggregate([
      { $match: { ref: /WebServiceWage/, status: true } },
      {
        $group: {
          _id: {
            $add: [{ $dayOfYear: '$createdAt' }, { $multiply: [0, { $year: '$createdAt' }] }],
          },
          day: { $sum: 1 },
          amounti: { $sum: '$from' },
          first: { $min: '$createdAt' },
        },
      },
      { $sort: { first: -1 } },
      { $limit: limit },
      { $project: { date: '$first', day: 1, userinvoice: 1, amount: '$amounti', _id: 0 } },
    ]);
  }

  async getFaildWebservice(limit: number): Promise<any> {
    return this.loggerModel.aggregate([
      { $match: { ref: /WebServiceWage/, status: false } },
      {
        $group: {
          _id: {
            $add: [{ $dayOfYear: '$createdAt' }, { $multiply: [0, { $year: '$createdAt' }] }],
          },
          day: { $sum: 1 },
          amounti: { $sum: '$amount' },
          first: { $min: '$createdAt' },
        },
      },
      { $sort: { first: -1 } },
      { $limit: limit },
      { $project: { date: '$first', day: 1, userinvoice: 1, amount: '$amounti', _id: 0 } },
    ]);
  }

  async getTotal(query): Promise<any> {
    return this.loggerModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: '$amount' },
        },
      },
    ]);
  }

  async pureQuery(query): Promise<any> {
    return this.loggerModel.find(query);
  }

  async getInfoByRef(ref: string): Promise<any> {
    return this.loggerModel
      .find({
        ref: ref,
      })
      .populate('to');
  }

  async getUserLog(query, page): Promise<any> {
    return await this.loggerModel.paginate(query, { page, populate: 'to from', sort: { createdAt: -1 }, limit: 50 });
  }

  async getDuplicate(): Promise<any> {
    //2020-01-19T02:15:23.544-04:30

    const data = await this.loggerModel.aggregate([
      { $match: { createdAt: { $gte: new Date('2020-01-19T02:15:23.544-04:30') } } },
      { $group: { _id: '$ref', count: { $sum: 1 }, amountx: { $sum: '$amount' }, userid: '$user' } },
      { $match: { _id: { $ne: null }, count: { $gt: 1 } } },
      { $sort: { count: -1 } },
      { $project: { ref: '$_id', _id: 0 } },
    ]);

    return data;
  }

  async makeFilter(): Promise<any> {}
}
