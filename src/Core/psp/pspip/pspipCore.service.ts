import { Model } from 'mongoose';
import { Injectable, Inject } from '@vision/common';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { PspipCoreDto } from './dto/pspipCore.dto';

@Injectable()
export class PspipCoreService {
  constructor(@Inject('PspipModel') private readonly pspipModel: Model<any>) {}

  private async addip(pspipCoreDto: PspipCoreDto): Promise<any> {
    const newpspip = new this.pspipModel(pspipCoreDto);
    return newpspip.save();
  }

  private async updateip(pspipCoreDto: PspipCoreDto): Promise<any> {
    return await this.pspipModel.findByIdAndUpdate(pspipCoreDto.id, pspipCoreDto);
  }

  private async removeip(pspipCoreDto: PspipCoreDto): Promise<any> {
    return await this.pspipModel.findOneAndRemove({ ip: pspipCoreDto.ip });
  }

  async newip(pspipCoreDto: PspipCoreDto): Promise<any> {
    if (isEmpty(pspipCoreDto.ip)) throw new FillFieldsException();
    return await this.addip(pspipCoreDto);
  }

  async update(pspipCoreDto: PspipCoreDto): Promise<any> {
    if (isEmpty(pspipCoreDto.ip) || isEmpty(pspipCoreDto.psp) || isEmpty(pspipCoreDto.id))
      throw new FillFieldsException();
    return await this.updateip(pspipCoreDto);
  }

  async remove(pspipCoreDto: PspipCoreDto): Promise<any> {
    if (isEmpty(pspipCoreDto.ip)) throw new FillFieldsException();
    return await this.removeip(pspipCoreDto);
  }
}
