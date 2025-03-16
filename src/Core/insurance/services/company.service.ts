import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';

@Injectable()
export class NationalInsuranceCompanyCommonService {
  constructor(@Inject('NationalInsuranceCompanyModel') private readonly companyModel: Model<any>) {}

  async new(userid: string, title: string): Promise<any> {
    return this.companyModel.create({
      title: title,
      user: userid,
    });
  }

  async getInfo(company: string): Promise<any> {
    return this.companyModel.findOne({
      _id: company,
    });
  }

  async getInfoByUserId(userid: string): Promise<any> {
    return this.companyModel.findOne({
      user: userid,
    });
  }
}
