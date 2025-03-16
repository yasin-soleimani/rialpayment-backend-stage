import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';

@Injectable()
export class SettingsUserDeveloperService {
  constructor(@Inject('SettingsDeveloperModel') private readonly developerModel: Model<any>) {}

  async addNewCallback(url: string, status: boolean, userid: string): Promise<any> {
    return this.developerModel.findOneAndUpdate(
      {
        user: userid,
      },
      {
        callback: {
          status: status,
          url: url,
        },
      },
      { new: true, upsert: true }
    );
  }

  async getInfo(userid: string): Promise<any> {
    return this.developerModel.findOne({ user: userid }).select({ user: 0 });
  }
}
