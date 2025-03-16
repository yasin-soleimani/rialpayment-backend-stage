import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';

@Injectable()
export class CheckoutBanksCoreService {
  constructor(@Inject('CheckoutBanksModel') private readonly bankModel: Model<any>) {}

  async getBanksList(): Promise<any> {
    return this.bankModel.find({
      status: true,
    });
  }

  async addBank(bankname: string): Promise<any> {
    return this.bankModel.create({
      name: bankname,
    });
  }

  async edit(id: string, bankname: string): Promise<any> {
    return this.bankModel.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: { name: bankname },
      }
    );
  }

  async changeStatus(id: string, status: boolean): Promise<any> {
    return this.bankModel.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: { status: status },
      }
    );
  }
}
