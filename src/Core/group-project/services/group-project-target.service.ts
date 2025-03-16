import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';

@Injectable()
export class GroupProjectTargetCoreService {
  constructor(
    @Inject('GroupProjectTargetModel') private readonly targetModel: Model<any>,
    @Inject('GroupProjectUserModel') private readonly groupModel: Model<any>
  ) {}

  async addNew(groupid: string, title: string): Promise<any> {
    return this.targetModel.create({
      group: groupid,
      title: title,
    });
  }

  async getUserTarger(userid): Promise<any> {
    return this.groupModel.findOne({ user: userid });
  }

  async getTargerInfo(targetid: string): Promise<any> {
    return this.targetModel.findOne({ _id: targetid }).populate('group');
  }
}
