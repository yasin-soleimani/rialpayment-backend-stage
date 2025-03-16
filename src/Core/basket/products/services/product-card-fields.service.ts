import { Inject, Injectable } from '@vision/common';
import { Model } from 'mongoose';

@Injectable()
export class BasketProductCardFieldsService {
  constructor(@Inject('BaksetProductCardFieldModel') private readonly productCardFieldModel: Model<any>) {}

  async addCardField(productid: string, title: string): Promise<any> {
    return this.productCardFieldModel.create({
      product: productid,
      title: title,
    });
  }

  async removeProductCards(productid: string): Promise<any> {
    const data = await this.productCardFieldModel.find({
      product: productid,
    });

    for (const info of data) {
      await this.productCardFieldModel.findByIdAndRemove(info._id);
    }
  }
}
