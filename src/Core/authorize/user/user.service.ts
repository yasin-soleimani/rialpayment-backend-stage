import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';

@Injectable()
export class AuthorizeUserzCoreService {
  constructor(@Inject('AuthorizeUserModel') private readonly authUserModel: any) {}

  async getInfoByApiKey(key: string): Promise<any> {
    return this.authUserModel.findOne({ apikey: key });
  }

  async submit(query): Promise<any> {
    return this.authUserModel.create(query);
  }

  async getPaginateList(query: any, page: number): Promise<any> {
    return this.authUserModel.paginate(query, { page: page, populate: 'auth user', sort: { createdAt: 1 }, limit: 50 });
  }

  async getList(userid: string): Promise<any> {
    return this.authUserModel.find({
      user: userid,
    });
  }

  async getCount(userid: string): Promise<any> {
    return this.authUserModel
      .find({
        user: userid,
      })
      .count();
  }

  async update(id: string, query): Promise<any> {
    return this.authUserModel.findOneAndUpdate(
      {
        _id: id,
      },
      query
    );
  }

  async changeStatus(id: string, status: boolean): Promise<any> {
    return this.authUserModel.findOneAndUpdate(
      {
        _id: id,
      },
      { $set: { status: status } }
    );
  }

  async changeStatusType(id: string, type: number): Promise<any> {
    return this.authUserModel.findOneAndUpdate(
      {
        _id: id,
      },
      { $set: { type: type } }
    );
  }
}
