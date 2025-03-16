import { Model } from 'mongoose';
import { Injectable, Inject } from '@vision/common';
import { AppVersionsModel, AppVersionsModelSchema } from './models/app-versions.model';

@Injectable()
export class AppVersionsCoreService {
  constructor(@Inject('AppVersions') private readonly AppVersionsModel: Model<AppVersionsModelSchema>) {}

  async newApp(getInfo: AppVersionsModel): Promise<AppVersionsModel> {
    return this.AppVersionsModel.create(getInfo);
  }

  async getList(): Promise<AppVersionsModel[]> {
    return this.AppVersionsModel.find().sort({ _id: -1 }).limit(20);
  }

  async getLast(): Promise<AppVersionsModel> {
    return this.AppVersionsModel.findOne().sort({ _id: -1 }).lean();
  }

  async getLastForce(): Promise<AppVersionsModel> {
    return this.AppVersionsModel.findOne({ force: true }).sort({ _id: -1 }).lean();
  }
}
