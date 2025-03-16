import { Injectable, Inject } from '@vision/common';

@Injectable()
export class CoreGiftCardSettingsCommonService {
  constructor(@Inject('GiftCardSettingsModel') private readonly settingsModel: any) {}

  async addNew(userId: string, groupId: string, price: number, discount: number): Promise<any> {
    return this.settingsModel.create({
      user: userId,
      group: groupId,
      price,
      discount,
    });
  }

  async edit(id: string, userId: string, groupId: string, price: number, discount: number): Promise<any> {
    return this.settingsModel.findOneAndUpdate(
      { _id: id },
      {
        user: userId,
        group: groupId,
        price,
        discount,
      }
    );
  }

  async changeStatus(id: string, status: boolean): Promise<any> {
    return this.settingsModel.findOneAndUpdate({ _id: id }, { $set: { status } });
  }

  async getListService(): Promise<any> {
    return this.settingsModel.find({ status: true, group: { $exists: true } }).populate('group');
  }

  async getSettingByGroupId(groupId: string): Promise<any> {
    return this.settingsModel.findOne({ group: groupId });
  }
}
