import { Injectable, Inject, successOptWithPagination, successOpt, faildOpt } from '@vision/common';
import { ClubCoreDto } from './dto/club-core.dto';
import { AccountService } from '../useraccount/account/account.service';
import { ClubSettingsCoreService } from '../settings/service/club-settings.service';
import { notEnoughMoneyException } from '@vision/common/exceptions/notEnoughMoney.exception';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { isNullOrUndefined } from 'util';
import { Types } from 'mongoose';
import { AclCoreService } from '../acl/acl.service';
import { UserService } from '../useraccount/user/user.service';
import { CardService } from '../useraccount/card/card.service';
import { addYearToExpire } from '@vision/common/utils/month-diff.util';
@Injectable()
export class ClubCoreService {
  constructor(
    @Inject('CustomerClubModel') private readonly clubModel: any,
    private readonly accountService: AccountService,
    private readonly clubSettingsService: ClubSettingsCoreService,
    private readonly aclService: AclCoreService,
    private readonly userService: UserService,
    private readonly cardService: CardService
  ) { }

  private async addnewClub(getInfo: ClubCoreDto): Promise<any> {
    const wallet = await this.accountService.getBalance(getInfo.ref, 'wallet');

    const aclInfo = await this.aclService.getAclUSer(getInfo.user);
    if (wallet) {
      const calc = await this.calcClub(getInfo);
      // Offer Code
      if (wallet.balance >= calc.company) {
        const userInfo = await this.userService.findById(getInfo.user);
        const nin = new Date().getTime();
        const uid = new Date().getTime();
        const pw = new Date().getTime();

        const newUser = await this.userService.regOperator(
          uid,
          pw,
          userInfo.fullname,
          getInfo.user,
          userInfo.nationalcode,
          'customerclub'
        );
        this.accountService.makeAccountID(newUser._id);
        this.accountService.makeWallet(newUser._id);
        this.accountService.makeCredit(newUser._id);
        this.accountService.makeDiscount(newUser._id);
        this.accountService.makeIdm(newUser._id);
        this.cardService.generateCard(newUser._id);
        this.userService.makeRefID(newUser._id);

        getInfo.owner = newUser._id;
        getInfo.expire = addYearToExpire(getInfo.priority);

        const clubData = await this.clubModel.create(getInfo);
        if (clubData) {
          this.accountService.dechargeAccount(getInfo.ref, 'wallet', calc.company);
          const title = ' هزینه ساخت باشگاه ' + getInfo.title;
          this.accountService.accountSetLogg(title, 'Club', calc.company, true, getInfo.ref, null);
          this.aclService.newClubAcl(newUser._id);
          if (!aclInfo) {
            this.aclService.newClubManagerAcl(getInfo.user);
          }
          return successOpt();
        } else {
          return faildOpt();
        }
      } else {
        throw new notEnoughMoneyException();
      }
    } else {
      throw new UserNotfoundException();
    }
  }

  async calcClub(getInfo: ClubCoreDto): Promise<any> {
    const data = await this.clubSettingsService.getPrice();
    let clubPrice = 1;
    if (getInfo.priority == 1) {
      clubPrice = data.clubprice;
    } else {
      clubPrice = data.clubprice2;
    }
    // calc giftcard price
    let giftCardPrice = 0;
    if (isNullOrUndefined(getInfo.cardinfo)) {
      getInfo.cardinfo = {
        status: false,
        giftcard: 0,
        price: 0,
        max: 0,
      };
    }
    if (getInfo.cardinfo.status == 'true') {
      giftCardPrice = data.giftcard;
    }
    // calc merchants
    let merchantPrice;
    if (isNullOrUndefined(getInfo.merchant)) {
      getInfo.merchant = {
        status: false,
        price: 0,
        max: 0,
      };
    }
    merchantPrice = getInfo.merchant.max * data.merchantreg;

    // calc personal page
    let personalpagePrice = 0;

    if (!isNullOrUndefined(getInfo.personalpage) && getInfo.personalpage.status == 'true') {
      personalpagePrice = data.personalpage;
    }

    let operator = 0;
    if (isNullOrUndefined(getInfo.operator)) {
      getInfo.operator = {
        status: false,
        price: 0,
        max: 0,
      };
    }
    operator = getInfo.operator.max * data.operator;
    // calc user registeration price
    let userPrice = 0;
    if (isNullOrUndefined(getInfo.userinfo)) {
      getInfo.userinfo = {
        status: false,
        price: 0,
        max: 0,
      };
    }
    userPrice = getInfo.userinfo.max * data.userreg;

    let merchantwage,
      customerwage = 0;
    if (getInfo.merchantwage == 'true') {
      merchantwage = data.merchantwage;
    } else {
      merchantwage = 0;
    }
    if (getInfo.customerwage == 'true') {
      customerwage = data.customerwage;
    }
    // total amount
    const total =
      clubPrice +
      userPrice +
      personalpagePrice +
      merchantPrice +
      giftCardPrice +
      operator +
      merchantwage +
      customerwage;
    const agent = Math.round((total * 40) / 100);
    const company = total - agent;
    const returnData = {
      giftcardprice: giftCardPrice,
      merchantprice: merchantPrice,
      personalpageprice: personalpagePrice,
      userregisterationprice: userPrice,
      clubprice: clubPrice,
      operator: operator,
      merchantwage: merchantwage,
      customerwage: customerwage,
      agent: agent,
      company: company,
      total: total,
    };
    return returnData;
  }

  private async editClub(getInfo: ClubCoreDto, clubid: string): Promise<any> {
    return this.clubModel.findOneAndUpdate({ _id: clubid }, getInfo);
  }

  private async changeStatus(clubid: string, status: boolean): Promise<any> {
    return this.clubModel.findOneAndUpdate({ _id: clubid }, { status: status });
  }

  private async getist(userid, page): Promise<any> {
    return this.clubModel.paginate({ ref: userid }, { page, sort: { createdAt: -1 }, limit: 10 });
  }

  async getList(userid, page): Promise<any> {
    const data = await this.getist(userid, page);
    return successOptWithPagination(data);
  }

  async getPrice(): Promise<any> {
    return this.clubSettingsService.getPrice();
  }

  async newClub(getInfo: ClubCoreDto): Promise<any> {
    return this.addnewClub(getInfo);
  }

  async getInfoByClubid(clubid: string): Promise<any> {
    return this.clubModel.findOne({ _id: clubid });
  }
  async getInfoByClubidUserId(clubid: string, userid: string): Promise<any> {
    return this.clubModel.findOne({ _id: clubid, ref: userid });
  }
  async getClubList(userid: string, page: number): Promise<any> {
    let aggregate = this.clubModel.aggregate();
    let ObjID = Types.ObjectId;
    aggregate.lookup({
      from: 'users',
      localField: 'owner',
      foreignField: '_id',
      as: 'userinfo',
    });

    aggregate.match({
      $or: [{ user: ObjID(userid) }, { ref: ObjID(userid) }],
    });
    aggregate.addFields({
      user: { $arrayElemAt: ['$userinfo.fullname', 0] },
      userid: { $arrayElemAt: ['$userinfo._id', 0] },
      tell: '$clubinfo.tell',
      fax: '$clubinfo.fax',
      website: '$clubinfo.website',
      email: '$clubinfo.email',
      address: '$clubinfo.address',
      province: '$clubinfo.province',
      city: '$clubinfo.city',
    });
    aggregate.project({
      title: 1,
      user: 1,
      tell: 1,
      fax: 1,
      website: 1,
      email: 1,
      address: 1,
      province: 1,
      city: 1,
      userid: 1,
    });
    var options = { page: page, limit: 50 };
    return this.clubModel.aggregatePaginate(aggregate, options);
  }

  async getClubInfo(ownerid): Promise<any> {
    return this.clubModel.findOne({ owner: ownerid });
  }

  async getDetails(clubid, userid): Promise<any> {
    let ObjID = Types.ObjectId;

    return this.clubModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userinfo',
        },
      },
      {
        $match: {
          $and: [
            { _id: ObjID(clubid) },
            {
              $or: [{ user: ObjID(userid) }, { ref: ObjID(userid) }],
            },
          ],
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ['$userinfo.fullname', 0] },
          userid: { $arrayElemAt: ['$userinfo._id', 0] },
        },
      },
      {
        $project: {
          userinfo: 0,
          __v: 0,
        },
      },
    ]);
  }

  async getUserClubs(userid): Promise<any> {
    return this.clubModel.findOne({ owner: userid });
  }

  async getClubsInfo(userid): Promise<any> {
    let ObjID = Types.ObjectId;
    let aggregate = this.clubModel.aggregate();
    aggregate.match({
      user: ObjID(userid),
    });
  }

  async getClubInfoByOwner(ownerid: string): Promise<any> {
    return this.clubModel.findOne({
      owner: ownerid,
    });
  }

  async getClubRemain(userid): Promise<any> {
    return this.clubModel.findOne({ owner: userid });
  }

  async decreaseUser(userid): Promise<any> {
    return this.clubModel.findOneAndUpdate({ owner: userid }, { $inc: { 'userinfo.max': -1 } });
  }

  async updateExpire(): Promise<any> {
    return this.clubModel.find({});
  }

  async findAndUpdateExpire(id: string, start: any, end: string): Promise<any> {
    return this.clubModel.findOneAndUpdate(
      {
        _id: id,
      },
      {
        createdAt: start,
        expire: end,
      }
    );
  }

  async uploadLogo(logo: string, clubid: string): Promise<any> {
    return this.clubModel.findOneAndUpdate(
      { _id: clubid },
      {
        $set: {
          logo,
        },
      }
    );
  }

  async getInfoByOwnerId(id: string): Promise<any> {
    return this.clubModel.findOne({ owner: id });
  }
}
