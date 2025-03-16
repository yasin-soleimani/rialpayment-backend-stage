import { Inject, Injectable } from '@vision/common';
import { Model } from 'mongoose';
import { CheckLeasingInfoTitleDto } from '../../Api/leasing-info/dto/check-leasing-info-title.dto';
import { CreateLeasingInfoDto } from './dto/create-leasing-info.dto';
import { UpdateLeasingInfoDto } from './dto/update-leasing-info.dto';
import { LeasingInfo, LeasingInfoDocument } from './interfaces/leasing-info.interface';

@Injectable()
export class LeasingInfoCoreService {
  constructor(@Inject('LeasingInfoModel') private readonly leasingInfoModel: Model<LeasingInfoDocument>) {}

  async checkDuplicateTitle(body: CheckLeasingInfoTitleDto): Promise<LeasingInfo> {
    const title = body.title.trim();
    const pattern = new RegExp(`/^${title}$/`);
    return this.leasingInfoModel.findOne({ title: { $regex: pattern } });
  }

  async getLeasingInfo(leasingUser: string): Promise<LeasingInfo> {
    return this.leasingInfoModel.findOne({ leasingUser }).lean();
  }

  async create(leasingUser: string, dto: CreateLeasingInfoDto): Promise<LeasingInfo> {
    const data = {
      leasingUser,
      ...dto,
    };
    return this.leasingInfoModel.create(data);
  }

  async updateLeasingInfo(id: string, dto: Partial<UpdateLeasingInfoDto>): Promise<LeasingInfo> {
    return this.leasingInfoModel.findOneAndUpdate({ _id: id }, { $set: { ...dto } }, { new: true });
  }
}
