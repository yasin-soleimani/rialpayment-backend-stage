import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';
import { SettingsClubDto } from '../dto/settings-club.dto';

@Injectable()
export class ClubSettingsCoreService {
  constructor(@Inject('SettingsClubModel') private readonly clubModel: Model<any>) {}

  async update(getInfo: SettingsClubDto): Promise<any> {
    return this.clubModel.findOneAndUpdate({ _id: 'EntityId' }, getInfo, { new: true, upsert: true });
  }

  async getPrice(): Promise<any> {
    return this.clubModel.findOne({ _id: 'EntityId' }).select({ __v: 0, _id: 0 });
  }
}
