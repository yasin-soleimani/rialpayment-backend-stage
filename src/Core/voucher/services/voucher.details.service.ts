import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';
import { VoucherDetailsCoreDto } from '../dto/voucher-details.dto';

@Injectable()
export class VoucherDetailsCoreService {
  constructor(@Inject('VoucherDetailsModel') private readonly detailsModel: Model<any>) {}

  async add(getInfo: VoucherDetailsCoreDto): Promise<any> {
    return this.detailsModel.create(getInfo);
  }

  async getInfo(voucherid: string): Promise<any> {
    return this.detailsModel.findOne({ voucher: voucherid }).populate('item.product');
  }

  async updateItems(voucherid: string, item): Promise<any> {
    return this.detailsModel.findOneAndUpdate(
      { voucher: voucherid },
      {
        $set: { item: item },
      }
    );
  }
}
