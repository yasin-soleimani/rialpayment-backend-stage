import { Inject, Injectable } from '@vision/common';

@Injectable()
export class MipgSharingService {
  constructor(@Inject('MipgSharingModel') private readonly mipgSharingModel: any) {}

  async addNew(mipg, user, percent): Promise<any> {
    return this.mipgSharingModel.create({
      mipg: mipg,
      user: user,
      percent: percent,
    });
  }

  async edit(mipg, user, percent): Promise<any> {
    return this.mipgSharingModel.findOneAndUpdate(
      {
        mipg: mipg,
        user: user,
      },
      {
        percent: percent,
      }
    );
  }

  async remove(mipg, user): Promise<any> {
    return this.mipgSharingModel.findOneAndRemove({
      mipg: mipg,
      user: user,
    });
  }

  async getList(id: string): Promise<any> {
    return this.mipgSharingModel
      .find({
        mipg: id,
      })
      .select({ __v: 0, createdAt: 0, updatedAt: 0 });
  }
}
