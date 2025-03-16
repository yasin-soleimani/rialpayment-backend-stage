import { Model } from 'mongoose';
import { Injectable, Inject } from '@vision/common';
import { PaymentlogsDto } from './dto/paymentlogs.dto';

@Injectable()
export class PaymentLogsService {
  constructor(@Inject('PaymentLogsModel') private readonly paymentLogsModel: Model<any>) {}

  async newLog(getInfo: PaymentlogsDto): Promise<any> {
    return this.paymentLogsModel.create(getInfo);
  }
}
