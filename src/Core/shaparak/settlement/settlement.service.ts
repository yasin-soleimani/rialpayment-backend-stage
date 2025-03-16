import { Inject, Injectable } from '@vision/common';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

@Injectable()
export class ShaparakSettlementService {
  constructor(@Inject('ShaparakSettlementModel') private readonly settlementModel: Model<any>) {}

  async submit(
    terminalid: number,
    amount: number,
    psp: number,
    karmozd: number,
    total: number,
    traxid: string,
    acceptorcode: string,
    terminal: string,
    sheba: string
  ): Promise<any> {
    return this.settlementModel.create({
      terminalid: terminalid,
      terminal: terminal,
      acceptorcode: acceptorcode,
      sheba: sheba,
      amount: amount,
      psp: psp,
      karmozd: karmozd,
      total: total,
      trax: traxid,
      date: new Date(),
    });
  }

  async getSettlement(start, end): Promise<any> {
    return this.settlementModel.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(start), $lt: new Date(end) },
        },
      },
      {
        $group: {
          _id: '$acceptorcode',
          tot: {
            $sum: '$total',
          },
          counter: { $sum: 1 },
        },
      },
    ]);
  }
}
