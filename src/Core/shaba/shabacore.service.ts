import { Model } from 'mongoose';
import { Injectable, Inject, InternalServerErrorException } from '@vision/common';
import { ShabacoreDto } from './dto/shabacore.dto';
import { Shabacore } from './interfaces/shabacore.interface';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';

@Injectable()
export class ShabacoreService {
  constructor(@Inject('ShabaModel') private readonly shabaModel: Model<Shabacore>) {}

  async findSheba(bankname: string): Promise<any> {
    return this.shabaModel.findOne({ bankname: bankname });
  }
  private async create(shabaDto: ShabacoreDto): Promise<any> {
    const newshaba = new this.shabaModel(shabaDto);
    return newshaba.save();
  }

  private async update(id: string, shabaDto: ShabacoreDto): Promise<any> {
    return await this.shabaModel.findByIdAndUpdate(id, shabaDto).exec();
  }

  private async delete(id: string): Promise<any> {
    return await this.shabaModel.findByIdAndRemove(id).exec();
  }

  async list(): Promise<any> {
    return await this.shabaModel.find().exec();
  }

  async addShaba(shabaDto: ShabacoreDto): Promise<any> {
    this.checkIO(shabaDto);

    const shaba = await this.create(shabaDto);
    if (!shaba) throw new InternalServerErrorException();
    return this.successOpt();
  }

  async updateShaba(id: string, shabaDto: ShabacoreDto): Promise<any> {
    this.checkIO(shabaDto);
    const shaba = await this.update(id, shabaDto);
    if (!shaba) throw new InternalServerErrorException();
    return this.successOpt();
  }

  async deleteShaba(id: string): Promise<any> {
    if (isEmpty(id)) throw new FillFieldsException();

    const shaba = await this.delete(id);
    if (!shaba) throw new InternalServerErrorException();
    return this.successOpt();
  }

  checkIO(shabaDto: ShabacoreDto) {
    if (isEmpty(shabaDto.shaba)) throw new FillFieldsException();
  }
  successOpt() {
    return {
      success: true,
      status: 200,
      message: 'عملیات با موفقیت انجام شد',
    };
  }
}
