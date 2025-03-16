import { Inject, Injectable } from '@vision/common';
import { MerchantTerminalCoreDto } from '../dto/merchanterminalcore.dto';
import { DuplicateException } from '@vision/common/exceptions/dup.exception';
import { Model, Types } from 'mongoose';
import { UserService } from '../../useraccount/user/user.service';
import { MerchantcoreService } from '../merchantcore.service';
import { TerminalType } from '@vision/common/enums/terminalType.enum';
import { AccountService } from '../../useraccount/account/account.service';
import { CardService } from '../../useraccount/card/card.service';

@Injectable()
export class MerchantCoreTerminalService {
  constructor(
    @Inject('MerchantTerminalModel') private readonly merchantTerminalModel: any,
    @Inject('DispatchermerchantModel') private readonly dispatcherService: Model<any>,
    private readonly cardService: CardService,
    private readonly userService: UserService,
    private readonly merchantService: MerchantcoreService,
    private readonly accountService: AccountService
  ) {}

  async searchTerminals(userid: string, page: number, search: string, merchantid: string): Promise<any> {
    const where = '/^' + search + '/.test(this.terminalid)';

    const query = {
      $and: [
        { merchant: merchantid },
        {
          $or: [
            { title: { $regex: search } },
            { province: { $regex: search } },
            { city: { $regex: search } },
            { $where: where },
          ],
        },
      ],
    };
    return this.merchantTerminalModel.paginate(query, { page, sort: { createdAt: -1 }, limit: 10 });
  }

  async getAllTermianls(page, sort?): Promise<any> {
    return this.merchantTerminalModel.paginate(
      { status: true, visible: true },
      {
        page,
        select: { psp: 0, user: 0, __v: 0, id: 0, createdAt: 0, updatedAt: 0, ref: 0 },
        populate: 'merchant',
        sort: sort,
        limit: 10,
      }
    );
  }

  async getTerminalsByMerchantId(merchantid: string): Promise<any> {
    return this.merchantTerminalModel.find({
      merchant: merchantid,
    });
  }

  async getTerminalInfoByTerminalid(terminalid: number): Promise<any> {
    return this.merchantTerminalModel
      .findOne({
        terminalid: terminalid,
      })
      .populate('pos');
  }

  async getInfoByID(id): Promise<any> {
    return this.merchantTerminalModel.findOne({ _id: id }).populate('merchant');
  }

  async addNewTerminal(getInfo: MerchantTerminalCoreDto): Promise<any> {
    const dispatcherDto = {
      dispatcheruser: '5bd63a9367054231508b1486',
      merchantcode: getInfo.terminalid.toString(),
      status: 'true',
    };
    const merchantType = await this.merchantService.getMerchantType(getInfo.merchant);
    if (merchantType.psp.type == TerminalType.Mobile) {
      const t = new Date().getTime();
      const nationalcode = Math.floor(t / 1000);
      const userInfo = await this.userService.regOperator(
        getInfo.mobile,
        getInfo.password,
        getInfo.fullname,
        merchantType.ref,
        nationalcode,
        'operator'
      );
      this.accountService.makeAccountID(userInfo._id);
      this.accountService.makeWallet(userInfo._id);
      this.accountService.makeCredit(userInfo._id);
      this.accountService.makeDiscount(userInfo._id);
      this.accountService.makeIdm(userInfo._id);
      this.cardService.generateCard(userInfo._id);
      getInfo.user = userInfo._id;
      const t2 = new Date().getTime();
      getInfo.terminalid = Math.floor(t2 / 1000);
    }

    const data = await this.merchantTerminalModel.findOne({ terminalid: getInfo.terminalid });
    if (data) throw new DuplicateException();
    this.dispatcherService.create(dispatcherDto).then((value) => {
      console.log(value);
    });
    return this.merchantTerminalModel.create(getInfo);
  }

  async searchTerminalsByUser(query, page, sort?): Promise<any> {
    if (query) {
      return this.merchantTerminalModel.paginate(query, { page, sort: sort, limit: 10 });
    } else {
      return this.merchantTerminalModel.paginate(
        { status: true, visible: true },
        {
          page,
          select: { psp: 0, user: 0, __v: 0, id: 0, createdAt: 0, updatedAt: 0, ref: 0 },
          populate: 'merchant',
          sort: sort,
          limit: 10,
        }
      );
    }
  }

  async searchTerminalAggregate(query, page, sort?): Promise<any> {
    let aggregate = this.merchantTerminalModel.aggregate();
    aggregate.lookup({
      from: 'merchantstrategies',
      localField: '_id',
      foreignField: 'terminal',
    });
  }

  // todo check User Auth acl to edit perm
  async editTerminal(terminalid: string, userid, getInfo: MerchantTerminalCoreDto): Promise<any> {
    const query = { _id: terminalid };
    const data = await this.merchantTerminalModel.findOne({ _id: terminalid });
    if (data) {
      const dispatcherDto = {
        dispatcheruser: '5bd63a9367054231508b1486',
        merchantcode: getInfo.terminalid.toString(),
        status: 'true',
      };
      this.dispatcherService.findOneAndUpdate({ merchantcode: data.terminalid }, dispatcherDto).then((value) => {
        console.log(value);
      });
    }
    return this.merchantTerminalModel.findOneAndUpdate(query, getInfo);
  }

  async setTerminalCreditStatus(type: number, terminalid, status): Promise<any> {
    return this.merchantTerminalModel.findOneAndUpdate({ _id: terminalid }, { iscredit: status, type: type });
  }

  async changeTerminalStatus(terminalid: number, status: boolean, userid): Promise<any> {
    const query = { $and: [{ _id: terminalid }, { $or: [{ ref: userid }, { user: userid }] }] };

    return this.merchantTerminalModel.findOneAndUpdate({ _id: terminalid }, { status: status });
  }

  async changeVisible(userid, terminalid, status): Promise<any> {
    const query = { $and: [{ _id: terminalid }] };
    return this.merchantTerminalModel.findOneAndUpdate(query, { visible: status });
  }
  async findMerchantByTerminalId(terminalid: number): Promise<any> {
    return this.merchantTerminalModel
      .findOne({ terminalid: terminalid })
      .populate({ path: 'merchant' })
      .populate('strategy');
  }
  async findPspByTerminalId(terminalid): Promise<any> {
    return this.merchantTerminalModel
      .findOne({ _id: terminalid })
      .populate({ path: 'merchant', populate: { path: 'psp' } });
  }
  async getListTerminals(userid, page, merchantcode, role): Promise<any> {
    console.log(role, 'role');
    let ObjID = Types.ObjectId;
    let query;
    if (role == 'customerclub') {
      query = {
        $or: [
          { $and: [{ merchant: ObjID(merchantcode) }, { club: ObjID(userid) }] },
          { merchant: ObjID(merchantcode) },
        ],
      };
    } else {
      query = { merchant: ObjID(merchantcode) };
    }
    let aggregate = this.merchantTerminalModel.aggregate();
    aggregate.lookup({
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'info',
    });
    aggregate.lookup({
      from: 'merchants',
      localField: 'merchant',
      foreignField: '_id',
      as: 'merchants',
    });
    aggregate.match(query);
    aggregate.addFields({
      fullname: { $arrayElemAt: ['$info.fullname', 0] },
      logo: { $arrayElemAt: ['$merchants.logo', 0] },
      mobile: { $arrayElemAt: ['$info.mobile', 0] },
      id: '_id',
    });
    aggregate.project({
      fullname: 1,
      mobile: 1,
      terminalid: 1,
      status: 1,
      visible: 1,
      province: 1,
      city: 1,
      title: 1,
      sheba: 1,
      address: 1,
      logo: 1,
      merchants: 1,
    });
    const options = { page: page, limit: 50 };
    return this.merchantTerminalModel.aggregatePaginate(aggregate, options);
  }

  async findByTerminal(terminalid): Promise<any> {
    return this.merchantTerminalModel.findOne({ _id: terminalid }).populate('merchant');
  }

  async findTerminalByIdAndUser(terminalid: string, userid: string): Promise<any> {
    return this.merchantTerminalModel
      .findOne({ _id: terminalid })
      .populate({ path: 'merchant', match: { $or: [{ user: userid }, { ref: userid }] } });
  }

  async getMerchantsAllTerminalsWithoutPagination(refid) {}
  async getMerchantsAllTerminal(refid, page, multi = false, pagination = true): Promise<any> {
    let ObjID = Types.ObjectId;
    let aggregate = this.merchantTerminalModel.aggregate();
    aggregate.lookup({
      from: 'merchants',
      localField: 'merchant',
      foreignField: '_id',
      as: 'merchant',
    });
    aggregate.lookup({
      from: 'psps',
      localField: 'merchant.psp',
      foreignField: '_id',
      as: 'ps',
    });
    aggregate.addFields({
      merchantcode: { $arrayElemAt: ['$merchant.merchantcode', 0] },
    });
    if (multi)
      aggregate.match({
        $and: [
          { status: true },
          {
            $or: [
              { 'merchant.user': { $in: refid } },
              { 'merchant.ref': { $in: refid } },
              { club: { $in: refid } },
              { 'merchant._id': { $in: refid } },
            ],
          },
        ],
      });
    else
      aggregate.match({
        $or: [{ 'merchant.user': ObjID(refid) }, { 'merchant.ref': ObjID(refid) }, { club: ObjID(refid) }],
      });
    aggregate.project({
      _id: 1,
      merchantcode: 1,
      title: 1,
      terminalid: 1,
      province: 1,
      city: 1,
      sheba: 1,
      address: 1,
      status: 1
    });
    if (pagination) {
      const options = { page: page, limit: 50 };
      return this.merchantTerminalModel.aggregatePaginate(aggregate, options);
    } else return aggregate.exec();
  }

  async searchAllTerminals(search, refid, page): Promise<any> {
    let ObjID = Types.ObjectId;
    let aggregate = this.merchantTerminalModel.aggregate();
    aggregate.lookup({
      from: 'merchants',
      localField: 'merchant',
      foreignField: '_id',
      as: 'merchant',
    });
    aggregate.lookup({
      from: 'psps',
      localField: 'merchant.psp',
      foreignField: '_id',
      as: 'ps',
    });
    aggregate.addFields({
      terminalz: { $toString: { $toLong: '$terminalid' } },
    });
    aggregate.addFields({
      merchantcode: { $arrayElemAt: ['$merchant.merchantcode', 0] },
    });
    aggregate.match({
      'merchant.ref': ObjID(refid),
      $or: [{ terminalz: { $regex: search } }, { title: { $regex: search } }],
    });
    aggregate.project({
      _id: 1,
      merchantcode: 1,
      title: 1,
      terminalid: 1,
      province: 1,
      city: 1,
    });
    const options = { page: page, limit: 50 };
    return this.merchantTerminalModel.aggregatePaginate(aggregate, options);
  }

  async searchAllTerminalsBackoffice(page, search): Promise<any> {
    let ObjID = Types.ObjectId;
    let aggregate = this.merchantTerminalModel.aggregate();
    aggregate.lookup({
      from: 'merchants',
      localField: 'merchant',
      foreignField: '_id',
      as: 'merchant',
    });
    aggregate.lookup({
      from: 'psps',
      localField: 'merchant.psp',
      foreignField: '_id',
      as: 'ps',
    });
    aggregate.addFields({
      terminalz: { $toString: { $toLong: '$terminalid' } },
    });
    aggregate.addFields({
      merchantcode: { $arrayElemAt: ['$merchant.merchantcode', 0] },
    });
    aggregate.match({
      $or: [{ terminalz: { $regex: search } }, { title: { $regex: search } }],
    });
    aggregate.project({
      _id: 1,
      merchantcode: 1,
      title: 1,
      terminalid: 1,
      province: 1,
      city: 1,
    });
    const options = { page: page, limit: 50 };
    return this.merchantTerminalModel.aggregatePaginate(aggregate, options);
  }

  async updateVisit(terminalid): Promise<any> {
    return this.merchantTerminalModel.findOneAndUpdate({ _id: terminalid }, { $inc: { visit: 1 } });
  }

  async setToCLub(terminalid: string, clubid: string): Promise<any> {
    return this.merchantTerminalModel.findOneAndUpdate({ _id: terminalid }, { $push: { club: clubid } });
  }

  async removeFromClub(terminalid: string, clubid: string): Promise<any> {
    return this.merchantTerminalModel.findOneAndUpdate({ _id: terminalid }, { $pull: { club: clubid } });
  }

  async getAllTerminalsReport(id: string): Promise<any> {
    return this.merchantTerminalModel
      .find({
        merchant: id,
      })
      .select({ _id: 1, title: 1 });
  }

  async getByClubUserOrLeasingUser(clubUser: string, leasingUser: string): Promise<any> {
    return this.merchantTerminalModel
      .find({ $or: [{ user: clubUser }, { user: leasingUser }], status: true })
      .select({
        title: 1,
        _id: 1,
      })
      .lean();
  }
}
