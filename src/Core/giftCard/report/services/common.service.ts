import { Injectable, Inject } from '@vision/common';
import { generatePinSync } from 'secure-pin';

@Injectable()
export class CoreGiftCardReportCommonService {
  constructor(@Inject('GiftCardReportModel') private readonly reportModel: any) {}

  async addCard(id: string, cardId: string, price: number, discount: number): Promise<any> {
    return this.reportModel.findOneAndUpdate(
      { _id: id },
      {
        card: cardId,
        price,
        discount,
      }
    );
  }

  async setMobile(mobile: string, groupId: string): Promise<any> {
    const code = generatePinSync(5);
    return this.reportModel.create({
      group: groupId,
      mobile,
      code: code.padStart(5, '0'),
    });
  }

  async getLastByMobile(mobile: string): Promise<any> {
    return this.reportModel.findOne({ mobile: mobile, card: { $exists: false } }).sort({ createdAt: -1 });
  }

  async setTerminal(id: string, terminal: string, ip: string): Promise<any> {
    return this.reportModel.findOneAndUpdate({ _id: id }, { $set: { terminal, ip } });
  }

  async getInfoById(id: string): Promise<any> {
    return this.reportModel.findOneAndUpdate({ _id: id }).populate('card');
  }

  async filter(query, page: number): Promise<any> {
    return this.reportModel.paginate(query, { page: page, populate: 'card', sort: { createdAt: -1 }, limit: 50 });
  }
}
