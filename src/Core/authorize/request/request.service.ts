import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';
import * as UniqueNumber from 'unique-number';

@Injectable()
export class AuthorizeRequestCoreService {
  constructor(@Inject('AuthorizeRequestModel') private readonly requestModel: Model<any>) {}

  async getInfo(id: string): Promise<any> {
    return this.requestModel.findOne({
      _id: id,
    });
  }

  async getToken(token: string): Promise<any> {
    return this.requestModel.findOne({
      token: token,
    });
  }

  async setToken(id: string): Promise<any> {
    const uniqueNumber = new UniqueNumber(true);
    const ref = 'Auth-' + uniqueNumber.generate();
    console.log(ref, 'ref');
    return this.requestModel
      .findOneAndUpdate(
        { _id: id },
        {
          $set: {
            token: ref,
          },
        }
      )
      .then((res) => {
        if (!res) return false;
        return ref;
      });
  }

  async submit(
    apikey: string,
    user: string,
    auth: string,
    ipserver: string,
    mobile: number,
    ipclient: string,
    type: number,
    trackingnumber: number
  ): Promise<any> {
    return this.requestModel.create({
      apikey: apikey,
      user: user,
      auth: auth,
      type: type,
      trackingnumber: trackingnumber,
      ip: ipserver,
      req: {
        mobile: mobile,
        ip: ipclient,
      },
    });
  }

  async pureQuery(cond: any, query: any): Promise<any> {
    return this.requestModel.findOneAndUpdate(cond, query);
  }

  async query(id: string, query): Promise<any> {
    return this.requestModel.findOneAndUpdate({ _id: id }, query);
  }

  async update(id: string, infostatus: boolean, buystatus: boolean, buymax?: number): Promise<any> {
    return this.requestModel.findOneAndUpdate(
      { _id: id },
      {
        req: {
          buy: {
            status: buystatus,
            max: buymax,
          },
          info: {
            status: infostatus,
          },
        },
      }
    );
  }
}
