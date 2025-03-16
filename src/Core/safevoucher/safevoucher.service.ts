import { Inject, Injectable } from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

@Injectable()
export class SafevoucherCoreService {
  constructor(@Inject('SafeVoucherModel') private readonly svModel: any) {}

  async newVoucher(user: string, amount: number, pin: number): Promise<any> {
    return this.svModel.create({
      user: user,
      amount: amount,
      pin: pin,
      mod: amount,
    });
  }

  async getList(userid: string, page: number): Promise<any> {
    return this.svModel.paginate(
      {
        user: userid,
      },
      { page, populate: 'user to', sort: { createdAt: -1 }, limit: 50 }
    );
  }

  async getUsedList(query, page: number): Promise<any> {
    console.log(query);
    let aggregate = this.svModel.aggregate(query);

    var options = { page: page, limit: 50 };
    return this.svModel.aggregatePaginate(aggregate, options);
    // return this.svModel.aggregate([
    //  { $unwind : "$details" }
    // ])

    // return this.svModel.paginate( query ,
    //   { page,populate: 'user to', sort: { createdAt: -1}, limit: 50 });
  }

  async find(voucherid: string): Promise<any> {
    return this.svModel.findOne({ id: voucherid });
  }

  async use(userid: string, voucherid: string, amount: number): Promise<any> {
    return this.svModel.findOneAndUpdate(
      { id: voucherid },
      {
        mod: 0,
        $push: {
          details: {
            user: userid,
            amount: amount,
            date: new Date().getTime(),
          },
        },
      }
    );
  }

  async useIpg(userid: string, voucherid: string, amount: number): Promise<any> {
    const data = await this.find(voucherid);
    if (!data) throw new UserCustomException('یافت نشد', false, 404);
    let mod;
    if (data.mod) {
      mod = Number(data.mod) - Number(amount);
    } else {
      mod = Number(data.amount) - Number(amount);
    }

    return this.svModel.findOneAndUpdate(
      { id: voucherid },
      {
        mod: mod,
        $push: {
          details: {
            user: userid,
            amount: amount,
            date: new Date().getTime(),
          },
        },
      }
    );
  }

  async getInfoById(id: string): Promise<any> {
    return this.svModel.findOne({ _id: id }).populate('details.user');
  }

  async changeStatus(id: string, status: number): Promise<any> {
    return this.svModel.findOneAndUpdate({ _id: id }, { type: status });
  }

  async update(): Promise<any> {
    const data = await this.svModel.find({
      to: { $exists: true },
      details: { $exists: false },
    });

    let counter = 1;
    for (const info of data) {
      await this.svModel.findOneAndUpdate(
        { _id: info._id },
        {
          mod: 0,
          $push: {
            details: {
              user: info.to,
              amount: info.amount,
              date: info.updatedAt,
            },
          },
        }
      );
      counter++;
    }
    console.log(counter);
  }

  async updateMod(): Promise<any> {
    const data = await this.svModel.find({
      to: { $exists: false },
      details: { $exists: false },
    });
    let counter = 1;

    for (const info of data) {
      await this.svModel.findOneAndUpdate(
        {
          _id: info._id,
        },
        {
          mod: info.amount,
        }
      );
      counter++;
    }

    console.log(counter);
  }
}
