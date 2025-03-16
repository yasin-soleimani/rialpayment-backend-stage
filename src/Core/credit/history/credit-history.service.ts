import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';

@Injectable()
export class CreditHistoryCoreService {
  constructor(
    @Inject('CreditHistoryModel') private readonly creditHistoryModel: any,
    @Inject('CreditInstallmentsModel') private readonly creditInstallmentsModel: Model<any>
  ) {}

  async submitNewHistoryRecord(getInfo): Promise<any> {
    return this.creditHistoryModel.create(getInfo);
  }

  async submitNewInstallsRecord(getInfo): Promise<any> {
    return this.creditInstallmentsModel.create(getInfo);
  }

  async updateRemain(shopid): Promise<any> {
    const data = await this.creditHistoryModel.findOne({ _id: shopid });
    if (!data) return false;
    if (data.remain > 0) {
      if (data.remain == 1) {
        return this.creditHistoryModel.findOneAndUpdate(
          { _id: shopid },
          { $set: [{ $inc: { remain: -1 } }, { status: false }] }
        );
      } else {
        return this.creditHistoryModel.findOneAndUpdate({ _id: shopid }, { $inc: { remain: -1 } });
      }
    }
    return false;
  }

  async getList(userid, page, type): Promise<any> {
    let typex;
    if (type == 1) {
      typex = true;
    } else {
      typex = false;
    }
    const query = { $and: [{ from: userid }, { status: typex }] };
    // const query = {};
    return this.creditHistoryModel.paginate(query, {
      page,
      populate: [
        { path: 'installmets' },
        { path: 'to' },
        { path: 'from' },
        { path: 'terminal', populate: { path: 'merchant' } },
      ],
      sort: { createdAt: -1 },
      limit: 10,
    });
  }

  async getShopDetails(shopid: string): Promise<any> {
    return this.creditHistoryModel
      .findOne({ _id: shopid })
      .populate({ path: 'installs', options: { sort: { date: 1 } } })
      .populate({ path: 'terminal', populate: { path: 'merchant' } })
      .sort({ date: 1 });
  }

  async GetDetails(shopid): Promise<any> {
    return this.creditInstallmentsModel
      .find({ shopid: shopid })
      .populate({ path: 'shopid', populate: { path: 'terminal', populate: { path: 'merchant' } } });
  }

  async payToInstall(installid, amount, date): Promise<any> {
    return this.creditInstallmentsModel.findOneAndUpdate(
      { _id: installid },
      { paidamount: amount, paiddate: date, paid: true }
    );
  }

  async getInstallDetails(id): Promise<any> {
    return this.creditInstallmentsModel.findOne({ _id: id }).populate({ path: 'shopid', populate: { path: 'to' } });
  }
}
