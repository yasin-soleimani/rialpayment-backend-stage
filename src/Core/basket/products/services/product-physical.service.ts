import { Injectable } from '@vision/common';
import { Types } from 'mongoose';
import { BasketParcelProductDetailDto } from '../../../../Api/basket/product/dto/product.dto';
import { BasketProductDto } from '../dto/product.dto';
import { BasketProductCommonService } from './product-common.service';

@Injectable()
export class BasketProductPhysicalService {
  constructor(private readonly commonService: BasketProductCommonService) {}

  async addNew(getInfo: BasketProductDto): Promise<any> {
    return this.commonService.new(getInfo);
  }

  async edit(getInfo: BasketProductDto, id: string): Promise<any> {
    return this.commonService.update(getInfo, id);
  }

  async setAllZero(userid: string): Promise<any> {
    return this.commonService.setAllZero(userid);
  }
  async setSpecialFalse(userid: string): Promise<any> {
    return this.commonService.setSpecialFalse(userid);
  }
  async setSpecialTrue(userid: string, id): Promise<any> {
    return this.commonService.setSpecialTrue(userid, id);
  }
  async getSpecialSells(store: string): Promise<any> {
    return this.commonService.getSpecialSells(store);
  }

  async addNewDetail(getInfo: BasketParcelProductDetailDto, productId: string): Promise<any> {
    return this.commonService.addParcelProductDetail(getInfo, productId);
  }

  async removeParcelProductDetail(detailId: string, productId: string): Promise<any> {
    return this.commonService.removeParcelProductDetail(detailId, productId);
  }

  async updateTheDetail(getInfo: BasketParcelProductDetailDto, productId: any, productDetailId: string): Promise<any> {
    return this.commonService.updateTheDetails(getInfo, productId, productDetailId);
  }

  async updateMultiOption(productId: string, multiOption: boolean): Promise<any> {
    return this.commonService.updateProductMultiOption(productId, multiOption);
  }
}
