import { Injectable, Inject } from '@vision/common';
import { BasketCategoryDto } from './dto/cateogry.dto';
import { Model } from 'mongoose';

@Injectable()
export class BaksetCategoryService {
  constructor(@Inject('BasketCategoryModel') private readonly categoryModel: Model<any>) {}

  async changeSlugToId(uri: RegExp, userId: string) {
    return this.categoryModel.findOne({ user: userId, slug: uri });
  }
  async findBySlugAndUserIdV2(slug: string, parent, userId: string): Promise<any> {
    return this.categoryModel.findOne({ user: userId, parent, slug: slug });
  }

  // for Hyper Markets API
  async findBySlugHyper(slug: string) {
    return this.categoryModel.findOne({ slug: slug, isHyperCat: true });
  }

  async getHyperCategories() {
    return this.categoryModel.find({ isHyperCat: true });
  }

  async editHyperCategory(getInfo: BasketCategoryDto): Promise<any> {
    return this.categoryModel.findOneAndUpdate({ _id: getInfo.id, isHyperCat: true }, getInfo, { new: true });
  }

  async findById(id: string): Promise<any> {
    return this.categoryModel.findOne({ _id: id });
  }

  async newV2(getInfo: BasketCategoryDto): Promise<any> {
    return this.categoryModel.create(getInfo);
  }

  async editV2(getInfo: BasketCategoryDto, userid: string): Promise<any> {
    return this.categoryModel.findOneAndUpdate({ _id: getInfo.id, user: userid }, getInfo);
  }

  async removeV2(id: string, userid: string): Promise<any> {
    return this.categoryModel.findOneAndRemove({ _id: id, user: userid });
  }

  async list(userid: string): Promise<any> {
    return this.categoryModel
      .find({
        user: userid,
      })
      .select({ __v: 0, user: 0, createdAt: 0, updatedAt: 0 })
      .populate('products');
  }

  async listViewV2(userid: string, parent: string): Promise<any> {
    let where = { user: userid };
    if (parent !== '') where['parent'] = parent === '/' ? parent : { $regex: parent + '$' };
    return this.categoryModel.find(where).select({ __v: 0, user: 0, createdAt: 0, updatedAt: 0 });
  }

  async findBySlugAndUserId(slug: string, userId: string): Promise<any> {
    return this.categoryModel.findOne({ user: userId, slug: slug });
  }

  async new(getInfo: BasketCategoryDto): Promise<any> {
    return this.categoryModel.create(getInfo);
  }

  async edit(getInfo: BasketCategoryDto, userid: string): Promise<any> {
    return this.categoryModel.findOneAndUpdate({ _id: getInfo.id, user: userid }, getInfo);
  }

  async remove(id: string, userid: string): Promise<any> {
    return this.categoryModel.findOneAndRemove({ _id: id, user: userid });
  }

  async listV2(userid: string, parent: string = ''): Promise<any> {
    let where = { user: userid };
    if (parent !== '') where['parent'] = parent === '/' ? parent : { $regex: parent + '$' };
    return this.categoryModel.find(where).select({ __v: 0, user: 0, createdAt: 0, updatedAt: 0 }).populate('products');
  }

  async listView(userid: string): Promise<any> {
    return this.categoryModel
      .find({
        user: userid,
      })
      .select({ __v: 0, user: 0, createdAt: 0, updatedAt: 0 });
  }
  async listViewHyper(): Promise<any> {
    return this.categoryModel
      .find({
        isHyperCat: true,
      })
      .select({ __v: 0, user: 0, createdAt: 0, updatedAt: 0 })
      .lean();
  }
}
