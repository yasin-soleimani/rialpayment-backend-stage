import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';

@Injectable()
export class IdentifyRejectCoreService {
  constructor(@Inject('IdentifyRejectModel') private readonly rejectModel: Model<any>) {}

  async addNew(userid: string, reason: string): Promise<any> {
    return this.rejectModel.create({
      user: userid,
      reason: reason,
    });
  }

  async getLast(userid: string): Promise<any> {
    return this.rejectModel
      .findOne({
        user: userid,
      })
      .sort({ createdAt: -1 });
  }
}
