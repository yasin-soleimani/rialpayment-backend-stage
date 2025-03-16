import { Injectable, Inject, BadRequestException } from '@vision/common';
import { BasketProductDto } from '../dto/product.dto';
import { BaksetProductTypes } from '../consts/products.const';
import { BasketProductCommonService } from './product-common.service';
import { BasketProductDownloadService } from './product-download.service';
import { BasketProductPhysicalService } from './product-physical.service';
import { BasketProductLisenceService } from './product-lisence.service';
import { BasketParcelProductDetailDto } from '../../../../Api/basket/product/dto/product.dto';

@Injectable()
export class BasketProductService {
  constructor(
    private readonly basketProductCommonService: BasketProductCommonService,
    private readonly downloadService: BasketProductDownloadService,
    private readonly physicalService: BasketProductPhysicalService,
    private readonly lisenceService: BasketProductLisenceService
  ) {}

  async new(getInfo: BasketProductDto): Promise<any> {
    switch (Number(getInfo.type)) {
      case BaksetProductTypes.Lisence: {
        return this.lisenceService.addNew(getInfo);
      }

      case BaksetProductTypes.Download: {
        return this.downloadService.addNew(getInfo);
      }

      case BaksetProductTypes.physical: {
        return this.physicalService.addNew(getInfo);
      }

      default: {
        throw new BadRequestException();
      }
    }
  }

  async update(getInfo: any, id: string): Promise<any> {
    switch (Number(getInfo.type)) {
      case BaksetProductTypes.Lisence: {
        return this.lisenceService.edit(getInfo, id);
      }

      case BaksetProductTypes.Download: {
        return this.downloadService.edit(getInfo, id);
      }

      case BaksetProductTypes.physical: {
        return this.physicalService.edit(getInfo, id);
      }

      default: {
        throw new BadRequestException();
      }
    }
  }
  async setAllZero(userid: string): Promise<any> {
    return this.physicalService.setAllZero(userid);
  }
  async setSpecialFalse(userid: string): Promise<any> {
    return this.physicalService.setSpecialFalse(userid);
  }
  async setSpecialTrue(userid: string, id: string): Promise<any> {
    return this.physicalService.setSpecialTrue(userid, id);
  }
  async getSpecialSells(store: string): Promise<any> {
    return this.physicalService.getSpecialSells(store);
  }

  async addNewDetail(getInfo: BasketParcelProductDetailDto, productId: string): Promise<any> {
    return this.physicalService.addNewDetail(getInfo, productId);
  }

  async findBySlugAndUserId(slug: string, userId: string): Promise<any> {
    return this.basketProductCommonService.findBySlugAndUserId(slug, userId);
  }

  async remove(id: string, userid: string): Promise<any> {
    return this.basketProductCommonService.remove(userid, id);
  }

  async getList(userid: string, page: number): Promise<any> {
    return this.basketProductCommonService.getList(userid, page);
  }

  async getListAll(userid: string): Promise<any> {
    return this.basketProductCommonService.getListAll(userid);
  }

  async getProductDetails(productid: string): Promise<any> {
    return this.basketProductCommonService.getProductDetails(productid);
  }

  async getListProducts(userid: string, page: number): Promise<any> {
    return this.basketProductCommonService.getListProducts(userid, page);
  }

  async getListAllProductsSearch(userid: string, page: number, searchParam: string, limit = 10): Promise<any> {
    return this.basketProductCommonService.getAllListProductsSearch(userid, page, searchParam, limit);
  }

  async getSingleProduct(userid: string, slug: string): Promise<any> {
    return this.basketProductCommonService.findBySlugAndUserId(slug, userid);
  }

  async getListProductsWithCategory(userid: string, page: number, category: string): Promise<any> {
    return this.basketProductCommonService.getListProductsWithCategory(userid, page, category);
  }
  async getListProductsWithCategoryV2(userid: string, page: number, category: string): Promise<any> {
    return this.basketProductCommonService.getListProductsWithCategoryV2(userid, page, category);
  }

  async getProductInfo(productid: string, userid: string): Promise<any> {
    return this.basketProductCommonService.getInfo(productid, userid);
  }

  async updateQty(productid: string, qty: number): Promise<any> {
    return this.basketProductCommonService.increase(productid, qty);
  }

  async updateDetailQty(productid: string, detailId: string, qty: number): Promise<any> {
    return this.basketProductCommonService.increaseDetail(productid, detailId, qty);
  }

  async getProductCards(): Promise<any> {}

  async removeParcelProductDetail(detailId: string, productId: any): Promise<any> {
    return this.physicalService.removeParcelProductDetail(detailId, productId);
  }

  async updateTheDetail(getInfo: BasketParcelProductDetailDto, productId: any, productDetailId: string): Promise<any> {
    return this.physicalService.updateTheDetail(getInfo, productId, productDetailId);
  }

  async updateMultiOption(productId: string, multiOption: boolean): Promise<any> {
    return this.physicalService.updateMultiOption(productId, multiOption);
  }

  async getAllProductsByCategoryId(categoryId: string): Promise<any> {
    return this.basketProductCommonService.getAllProductsByCatId(categoryId);
  }

  async getAllProductsByCategoryIdAndUser(categoryId: string, userid: string): Promise<any> {
    return this.basketProductCommonService.getAllProductsByCatIdAndUser(categoryId, userid);
  }
  checkSpecialSell(data: any) {
    let specialSell = null;
    if (!!data.specialSell) {
      const sps = data.specialSell;
      const now = new Date().getTime();
      if (sps.hasOwnProperty('price')) {
        if (sps.hasOwnProperty('from') && sps.from !== null && sps.hasOwnProperty('to') && sps.to !== null) {
          if (sps.from <= now && sps.to > now) specialSell = sps.price;
        } else specialSell = sps.price;
      }
    }
    return specialSell;
  }
  checkDetailsSpecialSell(
    data: any
  ): {
    price: any;
    qty: any;
    size: any;
    color: any;
    specialSell: any;
    qtyRatio: any;
    _id: any;
  }[] {
    const detailsArray = [];
    for (let document of data) {
      const detailsSpecialSell = this.checkSpecialSell(document);
      detailsArray.push({
        price: document.price,
        qty: document.qty,
        size: document.size,
        qtyRatio: document.qtyRatio,
        color: document.color,
        specialSell: detailsSpecialSell,
        _id: document._id,
      });
    }
    return detailsArray;
  }
}
