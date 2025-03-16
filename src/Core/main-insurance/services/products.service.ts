import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';

@Injectable()
export class MainInsuranceProductCoreService {
  constructor(@Inject('MainInsuranceProductModel') private readonly productModel: Model<any>) {}

  async add(): Promise<any> {
    return this.productModel.create();
  }

  async changeStatus(id: string, status: boolean): Promise<any> {
    return this.productModel.findByIdAndUpdate({ _id: id }, { $set: { status: status } });
  }

  async getList(catid: string): Promise<any> {
    return this.productModel
      .find({ category: catid })
      .populate('company details')
      .select({ __v: 0, category: 0, id: 0, 'details.product': 0 });
  }

  async getInfoById(id: string): Promise<any> {
    return this.productModel.findOne({ _id: id }).populate('company details');
  }
}
