import { Injectable, Inject, NotFoundException } from '@vision/common';
import { MerchantcoreDto } from './dto/merchantcore.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { AclCoreService } from '../acl/acl.service';
import { ClubCoreService } from '../customerclub/club.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { MerchantCoreTerminalBalanceService } from './services/merchant-terminal-balance.service';
import { Types } from 'mongoose';
import { ObjectID } from 'bson';
import { MerchantSettlementCashoutService } from '../merchant-settlement/services/merchant-settlement-cashout.service';
import moment from 'jalali-moment';

@Injectable()
export class MerchantcoreService {
  constructor(
    @Inject('MerchantModel') private readonly merchantModel: any,
    @Inject('MerchantHistoryModel') private readonly merchantHistoryModel: any,
    private readonly aclService: AclCoreService,
    private readonly clubService: ClubCoreService,
    private balanceInStoreService: MerchantCoreTerminalBalanceService,
    private readonly merchantSettlementCashout: MerchantSettlementCashoutService
  ) { }

  // Merchant Oprtations
  async addNewMerchant(merchantInfo: MerchantcoreDto, usertype: string): Promise<any> {
    if (usertype == 'customerclub') {
      const validation = await this.clubRegMerchantAcl(merchantInfo.ref, usertype);
      if (validation) {
        merchantInfo.status = true;
      }
    }
    return this.merchantModel.create(merchantInfo).catch((err) => {
      console.log(err, 'err');
    });
  }

  private async clubRegMerchantAcl(userid: string, usertype: string): Promise<any> {
    const aclInfo = await this.aclService.getAclUSer(userid);

    if (aclInfo) {
      if (aclInfo.customerclub == true) {
        const data = await this.clubService.getUserClubs(userid);
        const merchants = await this.merchantModel.find({ user: userid }).count();
        if (data.merchant.max <= merchants) throw new UserCustomException('بیش از حد مجاز می باشد');
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  async editMerchant(merchantcode: string, userid, getInfo: MerchantcoreDto): Promise<any> {
    // const data = this.merchantModel.findOne({  merchantcode: getInfo.merchantcode});
    // if ( data ) throw new DuplicateException();
    const query = { $and: [{ _id: merchantcode }, { $or: [{ user: userid }, { ref: userid }] }] };
    const lastSettle = await this.merchantSettlementCashout.getLastCashoutMerchant(merchantcode);
    if (!lastSettle && !!getInfo.autoSettlePeriod)
      await this.merchantSettlementCashout.create({
        merchant: merchantcode,
        user: userid,
        amount: 0,
        balanceAfter: 0,
        balanceBefore: 0,
        // createdAt: new Date(moment().locale('fa').startOf('day').toISOString()),
      });
    return this.merchantModel.findOneAndUpdate(query, getInfo);
  }

  async changeMerchantStatus(merchantcode: string, status: boolean, userid): Promise<any> {
    const query = { $and: [{ merchantcode }, { ref: userid }] };
    return this.merchantModel.findOneAndUpdate(query, { status });
  }

  async findByMerchant(merchantcode: number, userid: string): Promise<any> {
    const query = { $and: [{ merchantcode }, { $or: [{ user: userid }, { ref: userid }] }] };
    return this.merchantModel.findOne(query);
  }

  async findMerchantByID(id: string): Promise<any> {
    return this.merchantModel.findOne({ _id: id });
  }

  async searchMerchants(userid: string, category: string, search: string, page): Promise<any> {
    const query = this.selectSearchType(userid, category, search);
    return this.merchantModel.paginate(query, { page, populate: 'psp', sort: { createdAt: -1 }, limit: 10 });
  }

  private selectSearchType(userid, category, search) {
    const where = '/^' + search + '/.test(this.terminalid)';

    if (isEmpty(category) || category === 'All') {
      const query = {
        $and: [
          { $or: [{ user: userid }, { ref: userid }] },
          {
            $or: [
              { $where: where },
              { title: { $regex: search } },
              { province: { $regex: search } },
              { city: { $regex: search } },
              { categoty: { $regex: search } },
            ],
          },
        ],
      };
      return query;
    } else {
      const query = {
        $and: [
          { $or: [{ user: userid }, { ref: userid }] },
          {
            $or: [
              { $where: where },
              { title: { $regex: search } },
              { province: { $regex: search } },
              { city: { $regex: search } },
              { categoty: { $regex: search } },
            ],
          },
          { category: { $regex: category } },
        ],
      };
      return query;
    }
  }

  async getMerchantList(category, userid, page, sort?): Promise<any> {
    let ObjID = Types.ObjectId;
    let aggregate = this.merchantModel.aggregate();
    aggregate.lookup({
      from: 'merchantterminals',
      localField: '_id',
      foreignField: 'merchant',
      as: 'terminals',
    });
    aggregate.lookup({
      from: 'psps',
      localField: 'psp',
      foreignField: '_id',
      as: 'psp',
    });
    let query;
    if (isEmpty(category) || category == 0 || category == 'ALL') {
      query = { $or: [{ user: ObjID(userid) }, { ref: ObjID(userid) }, { 'terminals.club': ObjID(userid) }] };
    } else {
      query = {
        $and: [
          { $or: [{ user: ObjID(userid) }, { ref: ObjID(userid) }, { 'terminals.club': ObjID(userid) }] },
          { category },
        ],
      };
    }
    aggregate.match(query);
    aggregate.addFields({
      psp: { $arrayElemAt: ['$psp', 0] },
      id: '$_id',
    });
    aggregate.project({
      psp: 1,
      id: 1,
      category: 1,
      merchantcode: 1,
      lat: 1,
      long: 1,
      email: 1,
      title: 1,
      status: 1,
      user: 1,
      city: 1,
      province: 1,
      address: 1,
      autoSettle: 1,
      autoSettlePeriod: 1,
      autoSettleWage: 1,
      logo: 1,
      img1: 1,
      img2: 1,
      img3: 1,
      tell: 1,
    });
    var options = { page: page, limit: 50 };

    return this.merchantModel.aggregatePaginate(aggregate, options);
  }

  async getAllMerchants(page): Promise<any> {
    return await this.merchantModel.paginate(
      { status: true, visible: true },
      {
        page,
        select: { psp: 0, user: 0, __v: 0, id: 0, createdAt: 0, updatedAt: 0, ref: 0 },
        sort: { createdAt: -1 },
        limit: 10,
      }
    );
  }

  async getAllMerchantsReport(userid, multi = false): Promise<any> {

    if (multi) {
      return this.merchantModel
        .find({
          $or: [{ user: { $in: userid } }, { ref: { $in: userid } }],
        })
        .select({ _id: 1, title: 1, merchantcode: 1 });
    }
    
    return this.merchantModel
      .find({
        $or: [{ user: userid }, { ref: userid }],
      })
      .select({ _id: 1, title: 1, merchantcode: 1 });

  }
  async getMerchantType(merchantid): Promise<any> {
    const data = await this.merchantModel.findOne({ _id: merchantid }).populate('psp');
    if (!data) throw new NotFoundException();
    return data;
  }

  // Merchant Terminal History
  async submitNewMerchantHistory(getInfo): Promise<any> {
    const data = await this.balanceInStoreService.addToTerminalBalance(getInfo.terminal, getInfo.user, getInfo.amount);
    if (data) {
      return this.merchantHistoryModel.create(getInfo);
    } else {
      return false;
    }
  }

  async setMerchantTerminalHistoryLog(userid, terminalid, amount, exp?): Promise<any> {
    return {
      user: userid,
      terminal: terminalid,
      amount,
      exp,
    };
  }

  async getTotalBalanceInTerminal(userid, terminalid): Promise<any> {
    return this.merchantHistoryModel.aggregate([
      { $match: { $and: [{ user: userid }, { terminal: terminalid }] } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);
  }

  async getAllList(page): Promise<any> {
    let ObjID = Types.ObjectId;
    let aggregate = this.merchantModel.aggregate();
    aggregate.lookup({
      from: 'merchantterminals',
      localField: '_id',
      foreignField: 'merchant',
      as: 'terminals',
    });
    aggregate.lookup({
      from: 'merchantstrategies',
      localField: 'terminals._id',
      foreignField: 'terminal',
      as: 'discount',
    });
    aggregate.lookup({
      from: 'merchantcredits',
      localField: 'terminals._id',
      foreignField: 'terminal',
      as: 'credit',
    });
    aggregate.match({
      $and: [
        { visible: true },
        { terminals: { $exists: true, $not: { $size: 0 } } },
        {
          $or: [{ discount: { $exists: true, $not: { $size: 0 } } }, { credit: { $exists: true, $not: { $size: 0 } } }],
        },
      ],
    });
    var options = { page: page, limit: 50 };

    return this.merchantModel.aggregatePaginate(aggregate, options);
  }

  async showStore(storeid, userid): Promise<any> {
    return this.merchantModel.aggregate([
      {
        $match: {
          _id: new ObjectID(storeid),
        },
      },
      {
        $lookup: {
          from: 'merchantterminals',
          localField: '_id',
          foreignField: 'merchant',
          as: 'terminals',
        },
      },
      {
        $lookup: {
          from: 'merchantstrategies',
          localField: 'terminals._id',
          foreignField: 'terminal',
          as: 'discount',
        },
      },
      {
        $lookup: {
          from: 'merchantcredits',
          localField: 'terminals._id',
          foreignField: 'terminal',
          as: 'credit',
        },
      },
    ]);
  }

  async searchList(query, page): Promise<any> {
    let ObjID = Types.ObjectId;
    let aggregate = this.merchantModel.aggregate();
    aggregate.lookup({
      from: 'merchantterminals',
      localField: '_id',
      foreignField: 'merchant',
      as: 'terminals',
    });
    aggregate.lookup({
      from: 'merchantstrategies',
      localField: 'terminals._id',
      foreignField: 'terminal',
      as: 'discount',
    });
    aggregate.lookup({
      from: 'merchantcredits',
      localField: 'terminals._id',
      foreignField: 'terminal',
      as: 'credit',
    });
    aggregate.match(query);
    var options = { page: page, limit: 50 };

    return this.merchantModel.aggregatePaginate(aggregate, options);
  }

  async getMerchantInfoById(merchantid: string, userid, multi = false): Promise<any> {
    if (multi)
      return this.merchantModel.findOne({
        _id: merchantid,
        $or: [{ user: { $in: userid } }, { ref: { $in: userid } }, { _id: { $in: userid } }],
      });
    return this.merchantModel.findOne({
      _id: merchantid,
      $or: [{ user: userid }, { ref: userid }],
    });
  }

  async getMerchantsByActiveSettlement() {
    return this.merchantModel.find({ autoSettle: true });
  }

  async getMerchantsByUserId(userid: string): Promise<any> {
    return this.merchantModel.find({ user: userid });
  }
  async getMerchantsByUserIdAll(userid: string | ObjectID[], multi = false): Promise<any> {
    let ObjID = Types.ObjectId;
    if (multi && typeof userid === 'string')
      return this.merchantModel.find({
        $or: [{ user: ObjID(userid) }, { ref: ObjID(userid) }, { 'terminals.club': ObjID(userid) }],
      });
    else
      return this.merchantModel.find({
        $or: [{ user: { $in: userid } }, { ref: { $in: userid } }, { 'terminals.club': { $in: userid } }],
      });
  }
}
