import { Inject, Injectable } from '@vision/common';
import { PaginateModel, PaginateOptions, PaginateResult } from '../../utils/types.util';
import { CreateLeasingOptionDto } from './dto/create-leasing-option.dto';
import { LeasingOptionPatchAllowedTerminalsDto } from './dto/patch-allowed-terminals.dto';
import { UpdateLeasingOptionDto } from './dto/update-leasing-option.dto';
import { LeasingOption, LeasingOptionDocument } from './interfaces/leasing-option.interface';

@Injectable()
export class LeasingOptionCoreService {
  constructor(
    @Inject('LeasingOptionModel') private readonly leasingOptionModel: PaginateModel<LeasingOptionDocument>
  ) {}

  async create(leasingUser: string, dto: CreateLeasingOptionDto): Promise<LeasingOptionDocument> {
    const data = {
      leasingUser,
      ...dto,
    };
    return this.leasingOptionModel.create(data);
  }

  async getById(id: string): Promise<LeasingOption> {
    return this.leasingOptionModel.findOne({ _id: id }).lean();
  }

  async getAccessibleOptionById(id: string): Promise<LeasingOptionDocument> {
    return this.leasingOptionModel.findOne({ _id: id, status: true, visible: true });
  }

  async getAllByLeasingUser(leasingUser: string, page: number): Promise<PaginateResult<LeasingOption>> {
    const options: PaginateOptions = {
      page,
      limit: 50,
      populate: {
        path: 'terminals',
        select: {
          title: 1,
          _id: 1,
        },
      },
    };
    return this.leasingOptionModel.paginate(
      {
        leasingUser,
      },
      options
    );
  }

  async updateOption(id: string, dto: UpdateLeasingOptionDto): Promise<LeasingOptionDocument> {
    return this.leasingOptionModel.findOneAndUpdate({ _id: id }, { $set: { ...dto } }, { new: true });
  }

  async getByLeasingUserId(leasingUser: string): Promise<any> {
    return this.leasingOptionModel.find({ leasingUser: leasingUser, status: true, visible: true });
  }

  async patchAllowedTerminals(id: string, body: LeasingOptionPatchAllowedTerminalsDto): Promise<LeasingOptionDocument> {
    return this.leasingOptionModel.findOneAndUpdate(
      { _id: id },
      { $set: { terminals: body.terminals } },
      { new: true }
    );
  }
}
