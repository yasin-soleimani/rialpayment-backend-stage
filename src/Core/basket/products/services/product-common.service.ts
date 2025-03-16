import { Inject, Injectable } from '@vision/common';
import { Types } from 'mongoose';
import { BasketParcelProductDetailDto } from '../../../../Api/basket/product/dto/product.dto';
import { BasketProductDto } from '../dto/product.dto';

@Injectable()
export class BasketProductCommonService {
  constructor(@Inject('BasketProductModel') private readonly productModel: any) {}

  async new(getInfo: BasketProductDto): Promise<any> {
    return this.productModel.create(getInfo);
  }

  async getInfo(productid: string, userid: string): Promise<any> {
    return this.productModel.findOne({
      _id: productid,
      user: userid,
      deleted: false,
    });
  }

  async increase(productid: string, qty: number): Promise<any> {
    return this.productModel.findOneAndUpdate(
      {
        _id: productid,
      },
      {
        $inc: { qty: -qty },
      }
    );
  }

  async increaseDetail(productid: string, detailId: string, qty: number): Promise<any> {
    return this.productModel.findOneAndUpdate(
      {
        _id: productid,
        'details._id': detailId,
      },
      {
        $inc: { 'details.$.qty': -qty },
      }
    );
  }

  async update(getInfo: BasketProductDto, id: string): Promise<any> {
    return this.productModel.findOneAndUpdate(
      {
        _id: id,
        user: getInfo.user,
        deleted: false,
      },
      { $set: getInfo },
      { new: true }
    );
  }

  async setAllZero(userid: string): Promise<any> {
    return this.productModel.updateMany(
      {
        user: userid,
      },
      { $set: { qty: 0 } },
      { new: true }
    );
  }

  async setSpecialFalse(userid: string): Promise<any> {
    return this.productModel.updateMany(
      {
        user: userid,
      },
      { $set: { sp: false } },
      { new: true }
    );
  }

  async setSpecialTrue(userid: string, id: string): Promise<any> {
    return this.productModel.findOneAndUpdate(
      {
        _id: id,
        user: userid,
      },
      { $set: { sp: true } },
      { new: true }
    );
  }

  async getSpecialSells(store): Promise<any> {
    return this.productModel
      .find({
        user: store,
        sp: true,
        qty: { $gt: 0 },
      })
      .populate('category fields')
      .lean();
  }

  async remove(userid: string, id: string): Promise<any> {
    return this.productModel.findOneAndUpdate(
      {
        _id: id,
        user: userid,
      },
      { deleted: true }
    );
  }

  async getList(userid: string, page: number): Promise<any> {
    return this.productModel.paginate(
      {
        user: userid,
        deleted: false,
      },
      { page: page, populate: 'category fields', sort: { createdAt: -1 }, limit: 50 }
    );
  }
  async getListAll(userid: string): Promise<any> {
    return this.productModel.find({
      user: userid,
      deleted: false,
    });
  }

  async getProductDetails(productid): Promise<any> {
    return this.productModel
      .findOne({
        _id: productid,
      })
      .populate('fields')
      .sort({ createdAt: -1 });
  }

  async getListProducts(userid: string, page: number): Promise<any> {
    return this.productModel.paginate(
      {
        user: userid,
        deleted: false,
        qty: { $gt: 0 },
      },
      { page: page, populate: 'category', sort: { createdAt: -1 }, limit: 10 }
    );
  }

  async getAllListProductsSearch(userid: string, page: number, searchParam: string, limit = 10): Promise<any> {
    const searchRegex = new RegExp(searchParam);
    return this.productModel.paginate(
      {
        user: userid,
        deleted: false,
        $or: [{ title: { $regex: searchRegex, $options: 'i' } }, { slug: { $regex: searchRegex, $options: 'i' } }],
      },
      { page: page, populate: `category${limit === 50 ? ' fields' : ''}`, sort: { createdAt: -1 }, limit: limit }
    );
  }

  async findBySlugAndUserId(slug: string, userid: string): Promise<any> {
    return this.productModel.findOne({ user: userid, slug: slug, deleted: false }).populate('category');
  }

  async getListProductsWithCategoryV2(userid: string, page: number, category: string): Promise<any> {
    const paginate =
      page === 0
        ? { populate: 'category', sort: { createdAt: -1 } }
        : { page: page, populate: 'category', sort: { createdAt: -1 }, limit: 10 };
    return this.productModel.paginate(
      {
        user: userid,
        qty: { $gt: 0 },
        categoryMap: new RegExp('.*' + category + '.*'),
        deleted: false,
      },
      paginate
    );
  }
  async getListProductsWithCategory(userid: string, page: number, category: string): Promise<any> {
    return this.productModel.paginate(
      {
        user: userid,
        category: category,
        deleted: false,
      },
      { page: page, populate: 'category', sort: { createdAt: -1 }, limit: 10 }
    );
  }

  async addParcelProductDetail(getInfo: BasketParcelProductDetailDto, productId: string): Promise<any> {
    return this.productModel.findOneAndUpdate(
      { _id: Types.ObjectId(productId) },
      { $push: { details: getInfo } },
      { new: true }
    );
  }

  async removeParcelProductDetail(detailId: string, productId: any): Promise<any> {
    return this.productModel.findOneAndUpdate(
      { _id: Types.ObjectId(productId), 'details._id': Types.ObjectId(detailId) },
      { $pull: { details: { _id: Types.ObjectId(detailId as string) } } }
    );
  }

  async updateTheDetails(getInfo: BasketParcelProductDetailDto, productId: any, productDetailId: string): Promise<any> {
    return this.productModel.findOneAndUpdate(
      { _id: Types.ObjectId(productId), 'details._id': Types.ObjectId(productDetailId) },
      {
        $set: {
          'details.$.price': getInfo.price,
          'details.$.qty': getInfo.qty,
          'details.$.color': getInfo.color,
          'details.$.size': getInfo.size,
          'details.$.qtyType': getInfo.qtyType,
          'details.$.qtyRatio': getInfo.qtyRatio,
        },
      },
      { new: true }
    );
  }

  async updateProductMultiOption(productId: string, multiOption: boolean): Promise<any> {
    return this.productModel.findOneAndUpdate(
      { _id: productId },
      { $set: { multiOption: multiOption } },
      { new: true }
    );
  }

  async getAllProductsByCatId(catId: string): Promise<any> {
    return this.productModel.find({ category: catId, deleted: false });
  }

  async getAllProductsByCatIdAndUser(catId: string, userid: string): Promise<any> {
    return this.productModel.find({ category: catId, deleted: false, user: userid });
  }
}
