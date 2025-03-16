import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';

@Injectable()
export class MainInsuranceCompanyCoreService {
  constructor(@Inject('MainInsuranceCompanyModel') private readonly companyModel: Model<any>) {}

  async add(title: string, logo: string): Promise<any> {
    return this.companyModel.create({
      title: title,
      logo: logo,
    });
  }

  async chaneStatus(id: string, status: boolean): Promise<any> {
    return this.companyModel.findOneAndUpdate({ _id: id }, { $set: { status: status } });
  }
}
