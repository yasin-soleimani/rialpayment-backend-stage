import { Model, Types } from 'mongoose';
import { Injectable, Inject, InternalServerErrorException } from '@vision/common';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { PspverifyCoreDto } from './dto/pspverifyCore.dto';
import { PspRequestDto } from './dto/pspReq.dto';
import { AggregatePaginateModel } from '../../../utils/types.util';

@Injectable()
export class PspverifyCoreService {
  constructor(
    @Inject('PspVerifyModel') private readonly pspverifyModel: AggregatePaginateModel<any>,
    @Inject('PspRequestModel') private readonly pspReqModel: Model<any>,
    @Inject('PspCreditModel') private readonly pspCreditModel: Model<any>,
    @Inject('PspDiscountModel') private readonly pspDiscountModel: Model<any>,
    @Inject('PspOrganModel') private readonly pspOrganModel: any
  ) {}

  async getTraxInfoByTraxIdWithLog(traxId: number): Promise<any> {
    return this.pspverifyModel.findOne({ TraxID: traxId }).populate('log');
  }
  async newReq(reqInfo: PspRequestDto): Promise<any> {
    return this.pspReqModel.create(reqInfo);
  }

  async newPspVerify(pspInfo): Promise<any> {
    return this.pspverifyModel.create(pspInfo);
  }

  async newPspCredit(creditInfo): Promise<any> {
    return this.pspCreditModel.create(creditInfo);
  }

  async newPspDiscount(discountInfo): Promise<any> {
    return this.pspDiscountModel.create(discountInfo);
  }

  private async new(pspverifyDto: PspverifyCoreDto): Promise<any> {
    return await this.pspverifyModel.create(pspverifyDto);
  }

  async newVerify(pspverifyDto): Promise<any> {
    const verify = await this.new(pspverifyDto).catch((err) => {});
    console.log('verify', verify);
    if (!verify) throw new InternalServerErrorException();
    return verify;
  }

  async findByTraxID(traxid, termid): Promise<any> {
    return this.pspverifyModel
      .findOne({ TraxID: traxid, terminal: termid })
      .populate('user')
      .populate('cardref')
      .populate('merchantref')
      .populate('log')
      .populate('request')
      .populate('credit')
      .populate('discount')
      .populate({ path: 'terminal', populate: { path: 'merchant' } });
  }

  async confirm(traxid): Promise<any> {
    return this.pspverifyModel.findOneAndUpdate({ TraxID: traxid }, { confirm: true });
  }
  async confirmByTraxAndTerminal(traxid, terminal): Promise<any> {
    return this.pspverifyModel.findOneAndUpdate({ TraxID: traxid, terminal }, { confirm: true });
  }

  async confirmGate(merchantid, userid): Promise<any> {
    return this.pspverifyModel.findOneAndUpdate({ merchan: merchantid, user: userid }, { confirm: true });
  }

  async confirmById(confirmid): Promise<any> {
    return this.pspverifyModel.findOneAndUpdate({ _id: confirmid }, { confirm: true });
  }

  async reverse(traxid): Promise<any> {
    return this.pspverifyModel.findOneAndUpdate({ TraxID: traxid }, { reverse: true });
  }

  async updateError(traxid, errorMessage): Promise<any> {
    return this.pspverifyModel.findOneAndUpdate({ TraxID: traxid }, { Error: errorMessage });
  }

  async getPspFilter(query, page): Promise<any> {
    return this.pspverifyModel.paginate(query, {
      populate: ['terminal', 'user'],
      page,
      lean: false,
      sort: { createdAt: -1 },
      limit: 50,
    });
  }

  async getPspFilterAll(query): Promise<any> {
    return this.pspverifyModel.find(query).populate('terminal user');
  }

  async getPspFilterExcel(query): Promise<any> {
    const aggr = this.pspverifyModel.aggregate(query);
    return aggr.exec();
  }

  async getPspFilterAggregate(query, page): Promise<any> {
    const aggr = this.pspverifyModel.aggregate(query);
    console.log(JSON.stringify(query));
    return this.pspverifyModel.aggregatePaginate(aggr, {
      page,
      limit: 50,
    });
  }

  async getPspFilterExcelAggregate(query): Promise<any> {
    return this.pspverifyModel.aggregate(query);
  }

  async getFirstOrgan(userid, terminal): Promise<any> {
    return this.pspOrganModel.findOne({ ref: userid, terminal: terminal }).sort({ createdAt: 1 });
  }

  async getLastOrgan(userid, terminal): Promise<any> {
    return this.pspOrganModel.findOne({ ref: userid, terminal: terminal }).sort({ createdAt: -1 });
  }

  async getDetailsOrgan(userid: string, terminal: string, page: number): Promise<any> {
    return this.pspOrganModel.paginate(
      { ref: userid, terminal: terminal },
      {
        populate: ['terminal', 'user'],
        page,
        lean: false,
        sort: { createdAt: -1 },
        limit: 50,
      }
    );
  }
  async findOrgan(userid: string, page: number): Promise<any> {
    let ObjId = Types.ObjectId;
    let aggregate = this.pspOrganModel.aggregate();
    aggregate.lookup({
      from: 'merchantterminals',
      localField: 'terminal',
      foreignField: '_id',
      as: 'terminals',
    });
    aggregate.lookup({
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'users',
    });
    aggregate.match({
      ref: ObjId(userid),
    });
    aggregate.group({
      _id: '$terminal',
      terminals: {
        $push: '$terminals',
      },
      amount: { $sum: '$amount' },
      organ: { $sum: '$organ' },
      charge: { $sum: '$charge' },
    });
    var options = { page: page, limit: 50 };
    return this.pspOrganModel.aggregatePaginate(aggregate, options);

    // return this.pspOrganModel.paginate({ ref: userid } ,
    //   { populate: { path: 'terminal'},
    //   page , lean: false, sort : { createdAt : -1 } , limit : 10 });
  }

  async findTraxByUserInfo(merchantid, userid, start, end, confirm: boolean): Promise<any> {
    const query = {
      $and: [
        { merchant: merchantid },
        { user: userid },
        { confirm: confirm },
        {
          $or: [{ createdAt: { $gte: start, $lte: end } }],
        },
      ],
    };
    return this.pspverifyModel.findOne(query);
  }

  async newOrgan(charge, wallet, amount, organ, terminal, user, strategy, refid, cardid?): Promise<any> {
    return this.pspOrganModel.create({
      charge: charge,
      wallet: wallet,
      amount: amount,
      organ: organ,
      terminal: terminal,
      user: user,
      strategy: strategy,
      ref: refid,
      card: cardid,
    });
  }

  async getSuccess(limit): Promise<any> {
    return this.pspverifyModel.aggregate([
      { $match: { confirm: true } },
      {
        $lookup: {
          from: 'psprequests',
          localField: 'request',
          foreignField: '_id',
          as: 'requestz',
        },
      },
      {
        $group: {
          _id: {
            $add: [
              { $dayOfYear: '$createdAt' },
              {
                $multiply: [430, { $year: '$createdAt' }],
              },
            ],
          },
          day: { $sum: 1 },
          amounti: { $sum: { $arrayElemAt: ['$requestz.birthdate', 0] } },
          first: { $min: '$createdAt' },
        },
      },
      { $sort: { first: -1 } },
      { $limit: limit },
      { $project: { date: '$first', day: 1, userinvoice: 1, amount: '$amounti', requestz: 1, _id: 0 } },
    ]);
  }

  async getFaild(limit): Promise<any> {
    return this.pspverifyModel.aggregate([
      {
        $match: {
          $or: [{ reverse: true }, { reverse: false, confirm: false }],
        },
      },
      {
        $lookup: {
          from: 'psprequests',
          localField: 'request',
          foreignField: '_id',
          as: 'requestz',
        },
      },
      {
        $group: {
          _id: {
            $add: [
              { $dayOfYear: '$createdAt' },
              {
                $multiply: [430, { $year: '$createdAt' }],
              },
            ],
          },
          day: { $sum: 1 },
          amounti: { $sum: { $arrayElemAt: ['$requestz.birthdate', 0] } },
          first: { $min: '$createdAt' },
        },
      },
      { $sort: { first: -1 } },
      { $limit: limit },
      { $project: { date: '$first', day: 1, userinvoice: 1, amount: '$amounti', requestz: 1, _id: 0 } },
    ]);
  }

  async getTotal(query): Promise<any> {
    return this.pspverifyModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          total: { $sum: 5 },
          discount: { $sum: 1.2 },
        },
      },
    ]);
  }

  async getAllByQuery(query): Promise<any> {
    return this.pspverifyModel.find(query).populate('discount');
  }

  async getMerchantAllAmounts(merchants): Promise<any> {
    return this.pspverifyModel.aggregate([
      { $match: { merchantref: { $in: merchants } } },
      {
        $lookup: {
          from: 'psprequests',
          localField: 'request',
          foreignField: '_id',
          as: 'requestz',
        },
      },
      {
        $lookup: {
          from: 'merchants',
          localField: 'merchantref',
          foreignField: '_id',
          as: 'merchantz',
        },
      },
      {
        $group: {
          _id: { code: '$requestz.Merchant', title: '$merchantz.title' },
          amount: { $sum: '$requestz.Merchant' },
        },
      },
      {
        $addFields: {
          title: '$_id.title',
          merchantcode: '$_id.code',
          amount: '$amount',
        },
      },
      {
        $project: {
          title: 1,
          merchantcode: 1,
          amount: 1,
        },
      },
    ]);
  }

  async getLastTransaction(terminalId: any, merchantCode: any): Promise<any> {
    return this.pspverifyModel
      .findOne({ terminal: terminalId, merchantref: merchantCode, confirm: true })
      .sort({ createdAt: -1 });
  }

  async getReport(terminalId: any, merchantCode: any, start: any, end: any): Promise<any> {
    return this.pspverifyModel.find({
      terminal: terminalId,
      merchantref: merchantCode,
      confirm: true,
      createdAt: { $gte: start, $lte: end },
    });
  }
}
