import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';

@Injectable()
export class AuthorizeClientCoreService {
  constructor(@Inject('AuthorizeClientModel') private readonly authClientModel: Model<any>) {}

  async getListByUserid(userid: string): Promise<any> {
    return this.authClientModel
      .find({
        user: userid,
        status: true,
      })
      .populate('auth');
  }
  async getInfoByUserId(userid: string, auth: string): Promise<any> {
    return this.authClientModel
      .findOne({
        user: userid,
        auth: auth,
        status: true,
      })
      .populate('auth')
      .sort({ createdAt: -1 });
  }

  async getInfoById(id: string): Promise<any> {
    return this.authClientModel.findOne({
      _id: id,
    });
  }

  async updateByUseridAndId(userid: string, id: string, wallet: boolean, maxbuy: number): Promise<any> {
    return this.authClientModel.findOneAndUpdate(
      {
        user: userid,
        _id: id,
      },
      {
        $set: {
          permissions: {
            buy: {
              status: wallet,
              max: maxbuy,
            },
          },
        },
      }
    );
  }

  async changeStatus(userid: string, id: string, status: Boolean): Promise<any> {
    return this.authClientModel.findByIdAndUpdate(
      {
        _id: id,
        user: userid,
      },
      {
        $set: {
          status: status,
        },
      }
    );
  }

  async submit(userid: string, auth: string, wallet: boolean, maxbuy: number, info: boolean): Promise<any> {
    return this.authClientModel.create({
      user: userid,
      auth: auth,
      permissions: {
        buy: {
          status: wallet,
          max: maxbuy,
        },
        info: {
          status: info,
        },
      },
    });
  }
}
