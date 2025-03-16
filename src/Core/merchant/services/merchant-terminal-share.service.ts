import { Injectable, Inject } from '@vision/common';
import { Model } from 'mongoose';

@Injectable()
export class MerchantTerminalShareServie {
  constructor(@Inject('MerchantTerminalShareModel') private readonly ShareModel: Model<any>) {}

  async new(terminalid: string, percent: number, sheba: string): Promise<any> {
    return this.ShareModel.create({
      terminal: terminalid,
      sheba: sheba,
      percent: percent,
    });
  }

  async get(terminal: string): Promise<any> {
    return this.ShareModel.find({
      terminal: terminal,
    });
  }

  async remove(id: string): Promise<any> {
    return this.ShareModel.findOneAndRemove({
      _id: id,
    });
  }

  async udpate(sheba: string, percent: number, id: string): Promise<any> {
    return this.ShareModel.findOneAndUpdate(
      {
        _id: id,
      },
      {
        sheba: sheba,
        percent: percent,
      }
    );
  }
}
