import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';

@Injectable()
export class GroupProjectCoreService {
  constructor(
    @Inject('GroupProjectModel') private readonly groupModel: any,
    @Inject('GroupProjectUserModel') private readonly groupUserModel: any
  ) {}

  async getUserInfo(userid: string): Promise<any> {
    const data = await this.groupUserModel
      .findOne({ user: userid })
      .populate({ path: 'group', populate: { path: 'bank', match: { status: true } } });
    if (data) {
      return data.group;
    } else {
      return this.getInfoByCode('common');
    }
  }

  async getInfoByCode(code: string): Promise<any> {
    return this.groupModel.findOne({ code: code }).populate({ path: 'bank', match: { status: true } });
  }

  async addNew(getInfo): Promise<any> {
    delete getInfo.id;
    return this.groupModel.create(getInfo);
  }

  async edit(getInfo): Promise<any> {
    return this.groupModel.findOneAndUpdate(
      {
        _id: getInfo.id,
      },
      getInfo
    );
  }

  async addBankToGroup(id: string, bankid: string, userid: string): Promise<any> {
    return this.groupModel.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $push: { bank: bankid },
      }
    );
  }

  async addUserToGroup(userid: string, groupid: string): Promise<any> {
    return this.groupUserModel.create({
      user: userid,
      group: groupid,
    });
  }
}
