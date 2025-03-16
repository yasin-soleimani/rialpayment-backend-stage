import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';
import { SafeboxCoreDto } from './dto/safebox-core.dto';

@Injectable()
export class SafeboxCoreService {
  constructor(@Inject('SafeboxModel') private readonly safeboxModel: Model<any>) {}

  async newItem(getInfo: SafeboxCoreDto): Promise<any> {
    return this.safeboxModel.create(getInfo);
  }

  async chargeAccount(mobile, userid): Promise<any> {
    return this.getBalance(mobile);
  }

  private async getBalance(mobile): Promise<any> {
    return this.safeboxModel.find({ mobile: mobile, status: true }).populate('from');
  }
  async getMobileData(mobile): Promise<any> {
    return this.safeboxModel.find({ mobile: mobile });
  }

  async updateSafebox(id): Promise<any> {
    return this.safeboxModel.findByIdAndUpdate({ _id: id }, { status: false });
  }

  safeboxSetter(mobile, amount, from, invoiceid) {
    return {
      mobile: mobile,
      amount: amount,
      from: from,
      ref: invoiceid,
    };
  }
}
