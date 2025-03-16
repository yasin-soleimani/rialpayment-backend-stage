import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';
import { CheckoutBankAccountDto } from '../dto/account.dto';

@Injectable()
export class CheckoutBanksAccountCoreService {
  constructor(@Inject('CheckoutBankAccountsModel') private readonly accountModel: Model<any>) {}

  async addNew(getInfo: CheckoutBankAccountDto): Promise<any> {
    console.log(getInfo, 'getInfo');
    return this.accountModel.create(getInfo);
  }

  async edit(getInfo: CheckoutBankAccountDto): Promise<any> {
    const id = getInfo.id;
    delete getInfo.id;
    return this.accountModel.findOne({ _id: id }, getInfo);
  }

  async changeStatus(id: string, status: boolean): Promise<any> {
    return this.accountModel.findOneAndUpdate(
      { _id: id },
      {
        $set: { status: status },
      }
    );
  }

  async getList(): Promise<any> {
    return this.accountModel.find({});
  }
}
