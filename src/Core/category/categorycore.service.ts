import { Model } from 'mongoose';
import { Injectable, Inject } from '@vision/common';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { CategorycoreaddDto } from './dto/category-add.dto';
import { CategorycoreeditDto } from './dto/category-edit.dto';

@Injectable()
export class CategorycoreService {
  constructor(@Inject('CategoryModel') private readonly categoryModel: any) {}

  async addCategory(getInfo: CategorycoreaddDto): Promise<any> {
    if (isEmpty(getInfo.name)) throw new FillFieldsException();
    return this.categoryModel.create(getInfo);
  }

  async updateCategory(getInfo: CategorycoreeditDto): Promise<any> {
    if (isEmpty(getInfo.id)) throw new FillFieldsException();
    return this.categoryModel.findOneAndUpdate({ _id: getInfo.id }, getInfo).exec();
  }

  async getList(page): Promise<any> {
    return this.categoryModel.paginate({}, { page, sort: { createdAt: -1 }, select: { name: 1 }, limit: 10 });
  }

  async searchCat(catid): Promise<any> {
    return this.categoryModel.findOne({ _id: catid });
  }

  async getAll(): Promise<any> {
    return this.categoryModel.find().select({ name: 1 });
  }
}
