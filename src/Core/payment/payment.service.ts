import { Model } from 'mongoose';
import { Injectable, Inject } from '@vision/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './interfaces/payment.interface';
import { MipgShaparakDto } from '../../Service/mipg/dto/mipg-shaparak.dto';

@Injectable()
export class PaymentCoreService {
  constructor(@Inject('PaymentModel') private readonly paymentModel: any) {}

  async create(createAuthDto: CreatePaymentDto): Promise<Payment> {
    return await this.paymentModel.create(createAuthDto);
  }

  async getVerify(terminalid: string, invoiceid): Promise<any> {
    const query = { $and: [{ terminalid }, { invoiceid }] };
    return await this.paymentModel.findOne(query).exec();
  }
}
