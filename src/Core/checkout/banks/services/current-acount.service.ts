import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';
import { dateWithTz } from '@vision/common/utils/month-diff.util';

@Injectable()
export class CheckoutCurrentAccountCoreService {
  constructor(
    @Inject('CheckoutCurrentAccountModel') private readonly currentModel: any,
    @Inject('CheckoutBankAccountsModel') private readonly accountModel: any
  ) {}

  async getCurrentAccount(amount: number): Promise<any> {
    const today = dateWithTz();
    const currentInfo = await this.currentModel.findOne({ date: today }).populate('account');

    if (currentInfo) {
      const available = currentInfo.account.max - currentInfo.balance;

      if (available < amount) {
        return this.newAccount(amount, currentInfo, today);
      } else {
        await this.newSubmit(today, currentInfo.account._id, amount);
        return currentInfo.account;
      }
    } else {
      return await this.newToday(amount, today);
    }
  }

  private async newToday(amount: number, date: string) {
    const accountInfo = await this.accountModel.find({ status: true }).sort({ index: 1 });

    for (const info of accountInfo) {
      if (amount < info.max) {
        await this.submit(date, info._id, amount);
        return info;
      }
    }
  }

  private async newAccount(amount: number, current: any, date: string): Promise<any> {
    const accountInfo = await this.accountModel.find({
      status: true,
      index: { $gt: current.account.index },
    });

    for (const info of accountInfo) {
      if (amount < info.max) {
        await this.newSubmit(date, info._id, amount);
        return info;
      }
    }
  }

  private async submit(date, account, amount): Promise<any> {
    return this.currentModel.findOneAndUpdate(
      { date: date },
      {
        $set: {
          account: account,
        },
      },
      { new: true, upsert: true }
    );
  }

  async incBalance(date, amount): Promise<any> {
    return this.currentModel.findOneAndUpdate(
      { date: date },
      {
        $inc: { balance: amount },
      }
    );
  }

  async decBalance(date, amount): Promise<any> {
    return this.currentModel.findOneAndUpdate(
      { date: date },
      {
        $inc: { balance: -amount },
      }
    );
  }

  private async newSubmit(date, account, amount): Promise<any> {
    return this.currentModel.findOneAndUpdate(
      { date: date },
      {
        account: account,
        balance: 0,
      },
      { new: true, upsert: true }
    );
  }
}
