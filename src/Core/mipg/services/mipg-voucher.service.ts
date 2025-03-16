import { Inject, Injectable } from '@vision/common';
import { MipgVoucherCoreDto } from '../dto/mipg-voucher.dto';

@Injectable()
export class MipgVoucherCoreService {
  constructor(@Inject('MipgVoucherModel') private readonly voucherModel: any) {}

  async addNew(getInfo: MipgVoucherCoreDto): Promise<any> {
    return this.voucherModel.findOneAndUpdate(
      { mipg: getInfo.mipg },
      {
        mipg: getInfo.mipg,
        karmozd: getInfo.karmozd,
        type: getInfo.type,
        status: getInfo.status,
      },
      { new: true, upsert: true }
    );
  }

  async getInfo(id: string): Promise<any> {
    return this.voucherModel.findOne({ mipg: id });
  }
}
