import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';
import { NationalInsuranceCategoryCoreDto } from '../dto/insurance-category.dto';

@Injectable()
export class NationalInsuranceCategoryService {
  constructor(@Inject('NationalInsuranceCategoryModel') private readonly categoryModel: Model<any>) {}

  async new(getInfo: NationalInsuranceCategoryCoreDto): Promise<any> {
    return this.categoryModel.create({
      title: getInfo.title,
      company: getInfo.company,
      logo: getInfo.logo,
      code: getInfo.code,
    });
  }

  async update(getInfo: NationalInsuranceCategoryCoreDto): Promise<any> {
    return this.categoryModel.findOneAndUpdate(
      { _id: getInfo.id },
      {
        title: getInfo.title,
        company: getInfo.company,
        logo: getInfo.logo,
        code: getInfo.code,
      }
    );
  }

  async getList(company: string): Promise<any> {
    return this.categoryModel
      .find({
        company: company,
      })
      .populate('details');
  }

  async getListCompany(company: string): Promise<any> {
    return this.categoryModel
      .find({
        company: company,
      })
      .select({ _id: 1, title: 1, code: 1 });
  }

  async getInfoByCatId(categoryId: string): Promise<any> {
    return this.categoryModel.findOne({
      _id: categoryId,
    });
  }

  async getListByCompanyId(companyid: string): Promise<any> {
    return this.categoryModel
      .find({
        company: companyid,
      })
      .select({ __v: 0, company: 0 });
  }
}
