import { Injectable, Inject } from '@vision/common';
import { Types } from 'mongoose';

@Injectable()
export class GroupListCoreService {
  constructor(@Inject('GroupUserModel') private readonly groupUserModel: any) {}

  async getList(userid: string, groupid: string, page: number): Promise<any> {
    return this.groupUserModel.paginate(
      { group: groupid },
      { page, populate: { path: 'user card', populate: 'card user' }, limit: 50 }
    );
  }

  async getAll(groupid: string): Promise<any> {
    return this.groupUserModel
      .find({ group: groupid })
      .populate({ path: 'user', populate: { path: 'card' } })
      .populate({ path: 'card' });
  }

  async getUsersIdList(groupId: string): Promise<any> {
    const ObjId = Types.ObjectId;
    const users = await this.groupUserModel.aggregate([
      { $match: { group: ObjId(groupId) } },
      {
        $group: {
          _id: null,
          users: { $push: '$user' },
          total: { $sum: 1 },
        },
      },
    ]);

    return users;
  }
}
