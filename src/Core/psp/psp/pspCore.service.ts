import { Model } from 'mongoose';
import { Injectable, Inject } from '@vision/common';
import { PspCoreDto } from './dto/pspCore.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { User } from '../../../Api/auth/interfaces/auth.interface';

@Injectable()
export class PspCoreService {
  constructor(@Inject('PspModel') private readonly pspModel: Model<User>) {}

  private async create(pspCoreDto: PspCoreDto): Promise<any> {
    const newpsp = new this.pspModel(pspCoreDto);
    return newpsp.save();
  }

  async getPsp(id): Promise<any> {
    return this.pspModel.findById(id);
  }

  private async update(pspCoreDto: PspCoreDto): Promise<any> {
    const query = { terminalid: pspCoreDto.terminalid };
    return await this.pspModel.findOneAndUpdate(query, pspCoreDto).exec();
  }

  async checkValidate(username: string, password: string): Promise<any> {
    const data = await this.pspModel.findOne({
      username: username,
      password: password,
    });
    if (!data) return false;

    return true;
  }

  async getInfoByIp(ip): Promise<any> {
    return this.pspModel.findOne({ ip: ip });
  }
  private async delete(terminalidx: number): Promise<any> {
    const query = { terminalid: terminalidx };
    return await this.pspModel.findOneAndUpdate(query, { status: false }).exec();
  }

  async list(): Promise<any> {
    return await this.pspModel.find().populate('ips').exec();
  }

  async getListsFilter(): Promise<any> {
    return this.pspModel.find().select({ name: 1 });
  }

  async agentlist(): Promise<any> {
    return await this.pspModel.find().select({ name: 1, _id: 1 }).exec();
  }

  async addPsp(pspCoreDto: PspCoreDto): Promise<any> {
    this.checkArgs(pspCoreDto);
    return await this.create(pspCoreDto);
  }

  async updatePsp(pspCoreDto: PspCoreDto): Promise<any> {
    this.checkArgs(pspCoreDto);
    return await this.update(pspCoreDto);
  }

  async findByUsername(usernamex: string): Promise<any> {
    return this.pspModel.findOne({ username: usernamex });
  }

  private checkArgs(pspCoreDto: PspCoreDto) {
    if (isEmpty(pspCoreDto.name) || isEmpty(pspCoreDto.password) || isEmpty(pspCoreDto.username))
      throw new FillFieldsException();
  }

  async deletePsp(terminalid: number): Promise<any> {
    if (isEmpty(terminalid)) throw new FillFieldsException();
    return await this.delete(terminalid);
  }
}
