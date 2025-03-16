import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';
import { PricelistCoreDto } from '../dto/pricelist.dto';
import { PricelistDetailCoreDto } from '../dto/pricelist-detail.dto';

@Injectable()
export class PricelistCommonService {
  constructor(
    @Inject('PricelistModel') private readonly pricelistModel: Model<any>,
    @Inject('PricelistDetailsModel') private readonly pricelistDetailsModel: Model<any>
  ) {}

  // List Operations
  async addList(getInfo: PricelistCoreDto): Promise<any> {
    return this.pricelistModel.create(getInfo);
  }

  async getLists(userid): Promise<any> {
    return this.pricelistModel.find({ user: userid });
  }

  async editList(getInfo: PricelistCoreDto): Promise<any> {
    return this.pricelistModel.findOneAndUpdate({ _id: getInfo.id }, getInfo);
  }

  async removeList(listid): Promise<any> {
    return this.pricelistModel.findOneAndRemove({ _id: listid });
  }

  // store Operations
  async addDetail(getInfo: PricelistDetailCoreDto): Promise<any> {
    return this.pricelistDetailsModel.create(getInfo);
  }

  async editDetail(getInfo: PricelistDetailCoreDto): Promise<any> {
    return this.pricelistDetailsModel.findOneAndUpdate({ _id: getInfo.id }, getInfo);
  }

  async getDetail(detailsid): Promise<any> {
    return this.pricelistDetailsModel.findOne({ _id: detailsid });
  }

  async getDetails(parentid): Promise<any> {
    return this.pricelistDetailsModel.find({ parent: parentid });
  }
}
