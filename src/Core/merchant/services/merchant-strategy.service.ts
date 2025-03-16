import { Inject, Injectable } from '@vision/common';
import { MerchantStrategyDto } from '../dto/merchant-strategy.dto';
import { MerchantcoreService } from '../merchantcore.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { DiscountTypeEnum } from '@vision/common/enums/discount-type.enum';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { MerchantCoreTerminalService } from './merchant-terminal.service';
import { Types } from 'mongoose';
import { todayNum } from '@vision/common/utils/month-diff.util';

@Injectable()
export class MerchantDiscountStrategyService {
  constructor(
    private readonly terminalService: MerchantCoreTerminalService,
    @Inject('MerchantStrategyModel') private readonly strategyModel: any
  ) {}

  async newStrategy(getInfo: MerchantStrategyDto): Promise<any> {
    // if ( getInfo.type != DiscountTypeEnum.Base && isEmpty(getInfo.parent) )
    //   throw new FillFieldsException();
    if (getInfo.opt == 2) {
      let merchants = Array();
      const merchantLists = getInfo.terminal.split(',');
      for (let i = 0; merchantLists.length > i; i++) {
        if (merchantLists[i].length > 10) {
          merchants.push(merchantLists[i]);
        }
      }
      getInfo.terminal = merchants;
      return this.strategyModel.create(getInfo);
    }
    const terminalInfo = await this.terminalService.findTerminalByIdAndUser(getInfo.terminal, getInfo.user);
    if (!terminalInfo) throw new UserCustomException('پذیرنده مورد نظر یافت نشد', false, 404);
    return this.strategyModel.create(getInfo);
  }

  async getList(terminalid, userid): Promise<any> {
    return await this.strategyModel
      .find({ terminal: terminalid })
      .select({ __V: 0, terminal: 0, daysofweek: 0 })
      .populate({ path: 'terminal' });
  }

  async getDetails(groupid): Promise<any> {
    return this.strategyModel
      .find({
        parent: groupid,
      })
      .select({ __V: 0, terminal: 0, daysofweek: 0 });
  }

  async getGroupList(gid, userid): Promise<any> {
    return this.strategyModel
      .find({
        group: gid,
        type: DiscountTypeEnum.Base,
      })
      .select({ __V: 0, terminal: 0, daysofweek: 0 });
  }

  async remove(sid, userid): Promise<any> {
    return this.strategyModel.findOneAndRemove({ _id: sid });
  }

  async getSettings(userid, terminalid): Promise<any> {
    const ObjID = Types.ObjectId;
    return this.strategyModel.aggregate([
      {
        $lookup: {
          from: 'merchantterminals',
          localField: 'terminal',
          foreignField: '_id',
          as: 'terminals',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'terminals.user',
          foreignField: '_id',
          as: 'userinfo',
        },
      },
      {
        $lookup: {
          from: 'merchants',
          localField: 'terminals.merchant',
          foreignField: '_id',
          as: 'merchantinfo',
        },
      },
      {
        $match: {
          $and: [
            { terminal: ObjID(terminalid) },
            { $or: [{ 'merchantinfo.user': ObjID(userid) }, { 'merchantinfo.ref': ObjID(userid) }] },
          ],
        },
      },
      {
        $addFields: {
          fullname: { $arrayElemAt: ['$userinfo.fullname', 0] },
          mobile: { $arrayElemAt: ['$userinfo.mobile', 0] },
        },
      },
      {
        $project: {
          fullname: 1,
          mobile: 1,
          from: 1,
          to: 1,
          priority: 1,
        },
      },
    ]);
  }

  async getStrategy(terminalid: string): Promise<any> {
    const today = todayNum(new Date());
    return this.strategyModel.find({
      $and: [{ terminal: terminalid }, { daysofweek: { $in: [today] } }, { group: { $exists: false } }],
    });
  }
}
