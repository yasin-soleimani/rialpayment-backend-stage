import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';
import { SettingsDto } from '../dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(@Inject('SettingsModel') private readonly settingsModel: Model<any>) {}

  async update(getInfo: SettingsDto): Promise<any> {
    return this.settingsModel.findOneAndUpdate({ _id: 'EntityId' }, getInfo, { new: true, upsert: true });
  }

  async get(): Promise<any> {
    return this.settingsModel.findOne({ _id: 'EntityId' });
  }

  async changeSitadStatus(status: boolean): Promise<any> {
    return this.settingsModel.findOneAndUpdate(
      { _id: 'EntityId' },
      {
        sitad: status,
      }
    );
  }
}
