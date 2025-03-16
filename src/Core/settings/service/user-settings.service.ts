import { Inject, Injectable } from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

@Injectable()
export class UserSettingsService {
  constructor(@Inject('SettingsUserModel') private readonly userSettingModel: any) {}

  async getUserSettings(userid: string): Promise<any> {
    return this.userSettingModel.findOne({ user: userid });
  }

  async updateUserSettings(userid: string, cashout: any): Promise<any> {
    delete cashout.status;
    return this.userSettingModel.findOneAndUpdate(
      { user: userid },
      { $set: { 'cashout.range': cashout.range } },
      { new: true, upsert: true }
    );
  }

  async changeStatus(userid: string, status: boolean): Promise<any> {
    return this.userSettingModel.findOneAndUpdate(
      { user: userid },
      { $set: { 'cashout.status': status } },
      { new: true, upsert: true }
    );
  }
}
