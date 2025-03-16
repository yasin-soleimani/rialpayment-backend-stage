import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';
import { LeasingForm, LeasingFormDocument } from './interfaces/leasing-form.interface';
import { LeasingFormUpdateDto } from './dto/leasing-form-update.dto';

@Injectable()
export class LeasingFormCoreService {
  constructor(@Inject('LeasingFormModel') private readonly leasingFormModel: Model<LeasingFormDocument>) {}

  async add(data: LeasingForm): Promise<LeasingFormDocument> {
    return this.leasingFormModel.create(data);
  }

  async remove(id: string): Promise<LeasingFormDocument> {
    return this.leasingFormModel.findOneAndUpdate({ _id: id }, { $set: { deleted: true } }, { new: true });
  }

  async update(id: string, data: LeasingFormUpdateDto): Promise<LeasingFormDocument> {
    return this.leasingFormModel.findOneAndUpdate({ _id: id }, { $set: { ...data } }, { new: true });
  }

  async getByLeasingUser(leasingUser: string): Promise<LeasingForm[]> {
    return this.leasingFormModel
      .find({ leasingUser: leasingUser, deleted: false })
      .select({
        deleted: 0,
        leasingUser: 0,
      })
      .lean();
  }

  async getById(formId: string): Promise<LeasingForm> {
    return await this.leasingFormModel
      .findOne({ _id: formId })
      .select({
        deleted: 0,
        leasingUser: 0,
      })
      .lean();
  }
}
