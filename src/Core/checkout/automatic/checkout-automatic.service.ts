import { Injectable, Inject, InternalServerErrorException, successOpt } from '@vision/common';
import { Model } from 'mongoose';
import { CheckoutAutomaticCoreDto } from './dto/checkout-automatic.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { CheckoutCoreService } from '../checkout/checkoutcore.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

@Injectable()
export class CheckoutAutomaticService {
  constructor(@Inject('CheckoutAutomaticModel') private readonly automaticModel: Model<any>) {}

  async addNew(getInfo): Promise<any> {
    return this.automaticModel.create(getInfo);
  }

  async getLast(userid: string): Promise<any> {
    return this.automaticModel.findOne({ user: userid }).sort({ createdAt: -1 });
  }

  async changeStatus(id: string, status: boolean): Promise<any> {
    return this.automaticModel.findOne({ _id: id }, { status }).sort({ createdAt: -1 });
  }

  async getAll(userid: string): Promise<any> {
    return this.automaticModel.find({ user: userid, status: true });
  }

  async disableById(id: string): Promise<any> {
    return this.automaticModel.findOneAndUpdate({ _id: id }, { $set: { status: false } });
  }
  async disableAllByUserId(userid: string): Promise<any> {
    const data = await this.getAll(userid);

    for (const info of data) {
      this.disableById(info._id);
    }
  }
}
