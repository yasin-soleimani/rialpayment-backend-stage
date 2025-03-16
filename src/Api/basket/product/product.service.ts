import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  successOpt,
  successOptWithDataNoValidation,
  successOptWithPagination,
} from '@vision/common';
import { BasketProductService } from '../../../Core/basket/products/services/product.service';
import {
  BasketParcelProductDetailDto,
  BasketParcelProductSpecialPriceDto,
  BasketProductApiDto,
} from './dto/product.dto';
import * as uniqid from 'uniqid';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { imageTransform } from '@vision/common/transform/image.transform';
import { BasketProductCardService } from '../../../Core/basket/cards/cards.service';
import { BaksetProductTypes } from '../../../Core/basket/products/consts/products.const';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { get, Types } from 'mongoose';
import {
  BasketProductOptionDto,
  BasketProductOptionUpdateDto,
} from '../../../Core/basket/product-option/dto/product-option.dto';
import { BasketProductOptionCoreService } from '../../../Core/basket/product-option/product-option.service';
import { isNil } from '@vision/common/utils/shared.utils';
import { BaksetCategoryService } from '../../../Core/basket/category/category.service';
import { BasketProductImagesService } from '../../../Core/basket/images/images.service';
import { BasketStoreCoreService } from '../../../Core/basket/store/basket-store.service';
import { UPLOAD_URI } from '../../../__dir__';

@Injectable()
export class BasketProductApiService {
  constructor(
    private readonly productService: BasketProductService,
    private readonly basketCardService: BasketProductCardService,
    private readonly basketCategoryService: BaksetCategoryService,
    private readonly basketProductOptionCoreService: BasketProductOptionCoreService,
    private readonly basketImagesService: BasketProductImagesService,
    private readonly basketStoreService: BasketStoreCoreService
  ) {}

  async addNew(getInfo: BasketProductApiDto, req): Promise<any> {
    if (getInfo.description.length > 240) throw new FillFieldsException();
    this.checkFile(req);

    if (req.files && req.files.img) {
      const mime = this.checkMime(req.files.img.mimetype);
      const imgx = req.files.img;
      const uuid = uniqid();
      const img = uuid + '.' + mime;
      await imgx.mv(UPLOAD_URI + img, (err) => {
        if (err) throw new InternalServerErrorException();
      });

      getInfo.img = img;
    }

    const existingSlug = await this.productService.findBySlugAndUserId(getInfo.slug, getInfo.user);
    if (existingSlug) {
      throw new UserCustomException('slug تکراریست');
    }

    if (getInfo.details) {
      await this.checkParcelProductDetails(JSON.parse(getInfo.details as string));
    } else {
      if (getInfo.qty % getInfo.qtyRatio !== 0) {
        throw new UserCustomException('تعداد محصول باید مضربی از ضریب تعداد محصول باشد');
      }
    }
    if (getInfo.specialSell) {
      getInfo.specialSell = JSON.parse(getInfo.specialSell as string) as BasketParcelProductSpecialPriceDto;
      if (getInfo.specialSell.hasOwnProperty('price') && getInfo.specialSell.price >= getInfo.price)
        throw new FillFieldsException('مبلغ فروش ویژه باید کمتر از قیمت اصلی کالا باشد');
      this.checkSpecialSell(getInfo.specialSell);
    }

    const res = await this.productService.new(getInfo);
    if (!res) throw new InternalServerErrorException();
    return successOpt();
  }

  async update(getInfo: BasketProductApiDto, req): Promise<any> {
    if (req.files && req.files.img) {
      const mime = this.checkMime(req.files.img.mimetype);
      const imgx = req.files.img;
      const uuid = uniqid();
      const img = uuid + '.' + mime;
      await imgx.mv(UPLOAD_URI + img, (err) => {
        if (err) throw new InternalServerErrorException();
      });

      getInfo.img = img;
    } else {
      delete getInfo.img;
    }

    const existingSlug = await this.productService.findBySlugAndUserId(getInfo.slug, getInfo.user);
    if (existingSlug && getInfo.id !== existingSlug._id.toString()) {
      throw new UserCustomException('slug تکراریست');
    }

    if (getInfo.details) {
      await this.checkParcelProductDetails(JSON.parse(getInfo.details as string));
    } else {
      if (getInfo.qty % getInfo.qtyRatio !== 0) {
        throw new UserCustomException('تعداد محصول باید مضربی از ضریب تعداد محصول باشد');
      }
    }
    if (getInfo.specialSell) {
      getInfo.specialSell = JSON.parse(getInfo.specialSell as string);
      this.checkSpecialSell(getInfo.specialSell as BasketParcelProductSpecialPriceDto);
    }

    const res = await this.productService.update(getInfo, getInfo.id);
    if (!res) throw new InternalServerErrorException();
    return successOpt();
  }

  async addNewV2(getInfo: BasketProductApiDto, req): Promise<any> {
    if (getInfo.description.length > 240) throw new FillFieldsException();
    this.checkFile(req);

    if (req.files && req.files.img) {
      const mime = this.checkMime(req.files.img.mimetype);
      const imgx = req.files.img;
      const uuid = uniqid();
      const img = uuid + '.' + mime;
      await imgx.mv(UPLOAD_URI + img, (err) => {
        if (err) throw new InternalServerErrorException();
      });

      getInfo.img = img;
    }

    const existingSlug = await this.productService.findBySlugAndUserId(getInfo.slug, getInfo.user);
    if (existingSlug) {
      throw new UserCustomException('slug تکراریست');
    }

    if (getInfo.category) {
      const categoryData = await this.basketCategoryService.findById(getInfo.category);
      if (!categoryData) throw new UserCustomException('دسته بندی یافت نشد');
      getInfo.categoryMap =
        categoryData.parent === '/'
          ? categoryData.parent + categoryData._id
          : categoryData.parent + '/' + categoryData._id;
    }

    if (getInfo.details) {
      await this.checkParcelProductDetails(JSON.parse(getInfo.details as string));
    } else {
      if (getInfo.qty % getInfo.qtyRatio !== 0 && getInfo.type == BaksetProductTypes.physical) {
        throw new UserCustomException('تعداد محصول باید مضربی از ضریب تعداد محصول باشد');
      }
    }

    if (getInfo.specialSell) {
      getInfo.specialSell = JSON.parse(getInfo.specialSell as string) as BasketParcelProductSpecialPriceDto;
      if (getInfo.specialSell.hasOwnProperty('price') && getInfo.specialSell.price >= getInfo.price)
        throw new FillFieldsException('مبلغ فروش ویژه باید کمتر از قیمت اصلی کالا باشد');
      this.checkSpecialSell(getInfo.specialSell);
    }

    const res = await this.productService.new(getInfo);
    if (!res) throw new InternalServerErrorException();
    return successOpt();
  }

  async updateV2(getInfo: BasketProductApiDto, req): Promise<any> {
    if (req.files && req.files.img) {
      const mime = this.checkMime(req.files.img.mimetype);
      const imgx = req.files.img;
      const uuid = uniqid();
      const img = uuid + '.' + mime;
      const store = await this.basketStoreService.getInfo(getInfo.user);
      if (store.isHyper) {
        const image = await this.basketImagesService.getImageByBarcode(getInfo.slug);
        if (!image) {
          await imgx.mv(UPLOAD_URI + 'all/' + img, (err) => {
            if (err) throw new InternalServerErrorException();
          });
          const upsertImgBank = await this.basketImagesService.upsertImage({
            barcode: getInfo.slug,
            imageLink: 'all/' + img,
            productName: getInfo.title,
            category: getInfo.category,
          });
          console.log('UpsertDataImageBank::::::::::::::::::::::=>', upsertImgBank);
        }
      }
      await imgx.mv(UPLOAD_URI + img, (err) => {
        if (err) throw new InternalServerErrorException();
      });
      getInfo.img = img;
    } else {
      delete getInfo.img;
    }

    const existingSlug = await this.productService.findBySlugAndUserId(getInfo.slug, getInfo.user);
    if (existingSlug && getInfo.id !== existingSlug._id.toString()) {
      throw new UserCustomException('slug تکراریست');
    }
    if (getInfo.category) {
      const categoryData = await this.basketCategoryService.findById(getInfo.category);
      if (!categoryData) throw new UserCustomException('دسته بندی یافت نشد');
      getInfo.categoryMap =
        categoryData.parent === '/'
          ? categoryData.parent + categoryData._id
          : categoryData.parent + '/' + categoryData._id;
    }

    if (getInfo.details) {
      await this.checkParcelProductDetails(JSON.parse(getInfo.details as string));
    } else {
      if (getInfo.qty % getInfo.qtyRatio !== 0) {
        throw new UserCustomException('تعداد محصول باید مضربی از ضریب تعداد محصول باشد');
      }
    }

    if (getInfo.specialSell) {
      getInfo.specialSell = JSON.parse(getInfo.specialSell as string);
      this.checkSpecialSell(getInfo.specialSell as BasketParcelProductSpecialPriceDto);
    }

    const res = await this.productService.update(getInfo, getInfo.id);
    if (!res) throw new InternalServerErrorException();
    return successOpt();
  }

  async remove(id: string, userid): Promise<any> {
    this.productService.remove(id, userid);
    return successOpt();
  }

  async getList(userid: string, page: number, query = ''): Promise<any> {
    let res;
    if (!!query) res = await this.productService.getListAllProductsSearch(userid, page, query, 50);
    else res = await this.productService.getList(userid, page);
    let tmpArray = Array();

    for (const info of res.docs) {
      let Fields = Array();
      let category, id;
      if (!info.category) {
        id = null;
        category = 'بدون دسته';
      } else {
        id = info.category._id;
        category = info.category.title;
      }

      for (const field of info.fields) {
        Fields.push(field.title);
      }

      let qty = 0;
      if (info.type == BaksetProductTypes.Lisence) {
        qty = await this.getCardQty(info._id);
      } else {
        qty = info.qty;
      }

      const options = await this.basketProductOptionCoreService.getByBasketProductId(info._id);

      tmpArray.push({
        img: imageTransform(info.img),
        title: info.title,
        description: info.description,
        fields: Fields,
        category: {
          _id: id,
          title: category,
        },
        link: info.link,
        qty: qty,
        type: info.type,
        price: info.price,
        _id: info._id,
        updatedAt: info.updatedAt,
        slug: info.slug,
        metaTitle: info.metaTitle,
        metaDescription: info.metaDescription,
        details: info.details,
        hasDetails: info.hasDetails,
        qtyType: info.qtyType,
        qtyRatio: info.qtyRatio || 1,
        multiOption: info.multiOption,
        specialSell: info.specialSell,
        options: options,
      });
    }

    res.docs = tmpArray;
    return successOptWithPagination(res);
  }

  async updateAllProductsCategory(userid: string): Promise<any> {
    const res = await this.productService.getListAll(userid);
    const updatedArray = [];
    for (const product of res) {
      const categoryData = await this.basketCategoryService.findById(product.category);
      if (!!categoryData) {
        const categoryMap =
          categoryData.parent === '/'
            ? categoryData.parent + categoryData._id
            : categoryData.parent + '/' + categoryData._id;
        const update = await this.productService.update(
          { categoryMap: categoryMap, type: product.type, user: userid },
          product._id
        );
        if (!!update) updatedArray.push(update);
      }
    }
    return { updatedCount: updatedArray.length, updatedProducts: updatedArray };
  }

  private async getCardQty(productid: string): Promise<any> {
    const data = await this.basketCardService.getQty(productid);
    return data.length;
  }

  checkMime(mimetype: string) {
    switch (mimetype) {
      case 'image/png': {
        return 'png';
      }
      case 'image/jpg': {
        return 'jpg';
      }
      case 'image/jpeg': {
        return 'jpeg';
      }
    }
  }

  checkFile(req) {
    if (!req.files) throw new FillFieldsException();
    if (!req.files.img) throw new FillFieldsException();
  }

  async checkSlug(slug: string, userId: string): Promise<any> {
    const existingSlug = await this.productService.findBySlugAndUserId(slug, userId);
    if (existingSlug) {
      throw new UserCustomException('slug تکراریست');
    } else {
      return successOpt();
    }
  }

  async updateTheDetail(getInfo: BasketParcelProductDetailDto, productId: any, productDetailId: string): Promise<any> {
    const dtoIsValid = await this.checkParcelProductSingleDetail(getInfo);
    if (!dtoIsValid) throw new FillFieldsException('تمامی فیلد‌های جزئیات محصول را پر کنید');
    if (!Types.ObjectId.isValid(productDetailId))
      throw new FillFieldsException('تمامی فیلدهای جزئیات محصول را پر کنید');

    return this.productService.updateTheDetail(getInfo, productId, productDetailId);
  }

  async addNewDetail(getInfo: BasketParcelProductDetailDto, productId: any): Promise<any> {
    const dtoIsValid = await this.checkParcelProductSingleDetail(getInfo);
    if (!dtoIsValid) throw new FillFieldsException('تمامی فیلد‌های جزئیات محصول را پر کنید');
    if (!Types.ObjectId.isValid(productId)) throw new FillFieldsException('تمامی فیلدهای جزئیات محصول را پر کنید');
    return this.productService.addNewDetail(getInfo, productId);
  }

  async removeParcelDetail(productDetailId: string, productId: any): Promise<any> {
    if (!Types.ObjectId.isValid(productDetailId)) throw new FillFieldsException('تمامی فیلد‌ها را پر کنید');
    if (!Types.ObjectId.isValid(productId)) throw new FillFieldsException('تمامی فیلد‌ها را پر کنید');
    const data = await this.productService.removeParcelProductDetail(productDetailId, productId);
    if (data) {
      return successOpt();
    } else {
      throw new NotFoundException('موردی یافت نشد');
    }
  }

  private async checkParcelProductDetails(details: BasketParcelProductDetailDto[]): Promise<any> {
    if (!Array.isArray(details)) throw new FillFieldsException('تمامی فیلدهای جزئیات محصول را پر کنید');
    for (let i = 0; i < details.length; i++) {
      const element = details[i];
      const result = await this.checkParcelProductSingleDetail(element);
      if (!result) {
        throw new FillFieldsException('تمامی فیلد‌های جزئیات محصول را پر کنید.');
      }
    }
    return;
  }

  private async checkParcelProductSingleDetail(details: BasketParcelProductDetailDto): Promise<boolean> {
    if (!details.size) return false;
    if (!details.color) return false;
    if (typeof details.price !== 'number') return false;
    if (typeof details.qty !== 'number') return false;
    if (typeof details.qtyRatio !== 'number') return false;
    if (details.qty % details.qtyRatio !== 0) return false;
    if (details.specialSell) {
      this.checkSpecialSell(details.specialSell as BasketParcelProductSpecialPriceDto);
    }
    return true;
  }

  async addNewOption(productId: string, dto: BasketProductOptionDto): Promise<any> {
    if (isNil(dto.price) || isNil(dto.title)) {
      throw new FillFieldsException();
    }

    const result = await this.basketProductOptionCoreService.create(productId, dto);
    if (result) {
      return successOptWithDataNoValidation(result);
    }
  }

  async updateTheOption(productId: string, optionId: string, dto: BasketProductOptionUpdateDto): Promise<any> {
    if (isNil(dto.price) || isNil(dto.title)) {
      throw new FillFieldsException();
    }

    const result = await this.basketProductOptionCoreService.update(productId, optionId, dto);
    if (result) {
      return successOptWithDataNoValidation(result);
    }
  }

  async deleteTheOption(productId: string, optionId: string): Promise<any> {
    const data = await this.basketProductOptionCoreService.delete(productId, optionId);
    if (data) {
      return successOpt();
    }
  }

  async getAllOptions(productId: string): Promise<any> {
    const data = await this.basketProductOptionCoreService.getByBasketProductId(productId);
    return successOptWithDataNoValidation(data);
  }

  async updateMultiOptionStatus(productId: string, dto: { multiOption: boolean }): Promise<any> {
    if (isNil(dto) || isNil(dto.multiOption)) {
      throw new FillFieldsException('فیلد multiOption اجباریست');
    }
    const data = await this.productService.updateMultiOption(productId, dto.multiOption);
    if (data) {
      return successOptWithDataNoValidation(data);
    } else {
      throw new UserCustomException('خطای آپدیت multiOption');
    }
  }

  private checkSpecialSell(getInfo: BasketParcelProductSpecialPriceDto): any {
    if (!getInfo.hasOwnProperty('price') || (getInfo.hasOwnProperty('price') && typeof getInfo.price !== 'number'))
      throw new FillFieldsException('مبلغ فروش ویژه صحیح نمیباشد');
    if (getInfo.hasOwnProperty('from') && typeof getInfo.from !== 'number')
      throw new FillFieldsException('تاریخ شروع فروش ویژه صحیح نمیباشد');
    else if (getInfo.hasOwnProperty('to') && typeof getInfo.to !== 'number')
      throw new FillFieldsException('تاریخ پایان فروش ویژه صحیح نمیباشد');
    else if (getInfo.from >= getInfo.to)
      throw new FillFieldsException('تاریخ پایان فروش ویژه باید بیشتر از تاریخ شروع باشد.');
  }
}
