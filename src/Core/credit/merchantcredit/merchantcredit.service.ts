import { Injectable, CreditStatusEnums, Inject } from '@vision/common';
import { MerchantCreditCoreDto } from './dto/merchantcreditcore.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { Model } from 'mongoose';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';

@Injectable()
export class MerchantCreditCoreService {
  constructor(@Inject('MerchantCreditModel') private readonly merchantCreditService: Model<any>) {}

  async addNew(getInfo: MerchantCreditCoreDto): Promise<any> {
    this.checkInputs(getInfo);
    return this.merchantCreditService.findOneAndUpdate({ terminal: getInfo.terminal }, getInfo, {
      new: true,
      upsert: true,
    });
  }

  async getList(terminalid: string, userid: string): Promise<any> {
    return this.merchantCreditService
      .findOne({ terminal: terminalid })
      .select({ terminal: 0, __v: 0 })
      .populate({
        path: 'terminal',
        populate: { path: 'merchant', match: { $or: [{ user: userid }, { ref: userid }] } },
      });
  }

  async getDetails(id: string): Promise<any> {
    return this.merchantCreditService.find({ terminal: id });
  }

  async getOneDetails(id: string): Promise<any> {
    return this.merchantCreditService.findOne({ terminal: id });
  }

  async edit(getInfo: MerchantCreditCoreDto): Promise<any> {
    this.checkInputs(getInfo);
    return this.merchantCreditService.findOneAndUpdate({ terminal: getInfo.terminal }, getInfo);
  }

  async remove(getInfo: MerchantCreditCoreDto): Promise<any> {
    return this.merchantCreditService.findOneAndRemove({ terminal: getInfo.terminal });
  }

  async changeStatus(getInfo: MerchantCreditCoreDto, status): Promise<any> {
    return this.merchantCreditService.findOneAndUpdate({ terminal: getInfo.terminal }, { status: status });
  }

  async getTerminalCreditInfo(terminalid): Promise<any> {
    return this.merchantCreditService.findOne({ terminal: terminalid });
  }

  private checkInputs(getInfo: MerchantCreditCoreDto) {
    if (isEmpty(getInfo.type) || isEmpty(getInfo.terminal) || isEmpty(getInfo.tenday)) {
      throw new FillFieldsException();
    }
  }
}
