import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';

@Injectable()
export class MainInsuranceCategoryCoreService {
  constructor(@Inject('MainInsuranceCategoryModel') private readonly categoryModel: Model<any>) {}

  async add(title: string): Promise<any> {
    return this.categoryModel.create({ title: title });
  }

  async changeStatus(id: string, status: boolean): Promise<any> {
    return this.categoryModel.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: { status: status },
      }
    );
  }

  async getInfoByCode(code: number): Promise<any> {
    return this.categoryModel.findOne({ code: code });
  }
}
