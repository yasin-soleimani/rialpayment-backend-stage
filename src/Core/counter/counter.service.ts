import { Injectable, Inject } from '@vision/common';
import * as momentjs from 'jalali-moment';

@Injectable()
export class CounterCoreService {
  constructor(@Inject('CounterModel') private readonly counterModel: any) {}

  async getNumber(): Promise<any> {
    const getYear = momentjs().locale('fa').format('YYYY');
    const { counter } = await this.counterModel.findOneAndUpdate(
      { year: getYear, counterType: '' },
      { $inc: { counter: 1 } },
      { new: true, upsert: true }
    );
    return counter;
  }

  async getTaxiNumber(): Promise<any> {
    const { counter } = await this.counterModel.findOneAndUpdate(
      { counterType: 'taxi' },
      { $inc: { counter: 1 }, $set: { year: 1 } },
      { new: true, upsert: true }
    );
    return counter;
  }

  async getLeasingFormNumber(): Promise<any> {
    const { counter } = await this.counterModel.findOneAndUpdate(
      { counterType: 'leasingForm' },
      { $inc: { counter: 1 }, $set: { year: 1 } },
      { new: true, upsert: true }
    );
    return counter;
  }

  async getTerminalId(): Promise<any> {
    const { counter } = await this.counterModel.findOneAndUpdate(
      { counterType: 'TerminalId' },
      { $inc: { counter: 1 }, $set: { year: 1 } },
      { new: true, upsert: true }
    );
    return counter;
  }

  async getMerchantId(): Promise<any> {
    const { counter } = await this.counterModel.findOneAndUpdate(
      { counterType: 'MerchantId' },
      { $inc: { counter: 1 }, $set: { year: 1 } },
      { new: true, upsert: true }
    );
    return counter;
  }
}
