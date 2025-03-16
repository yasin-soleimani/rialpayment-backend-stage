import { Injectable, Inject } from '@vision/common';
import { Types } from 'mongoose';

@Injectable()
export class MerchantCoreTerminalInfoService {
  constructor(
    @Inject('MerchantTerminalModel') private readonly merchantTerminalModel: any,
    @Inject('MerchantModel') private readonly merchantModel: any
  ) {}

  async getTerminalsByUserId(userId: string): Promise<any> {
    return this.merchantTerminalModel
      .find({
        $or: [{ user: userId }, { club: userId }],
      })
      .populate('merchant');
  }

  async getTerminalsByUserIdAll(userId: string): Promise<any> {
    const merchants = await this.getMerchantsByUserIdAll(userId);
    if (!merchants) return false;

    const terminals = Array();

    for (const info of merchants) {
      const terminal = await this.getTerminalsByMerchantId(info._id);

      for (const item of terminal) {
        terminals.push(item);
      }
    }
    return terminals;
  }

  private async getMerchantsByUserIdAll(userid: string): Promise<any> {
    let ObjID = Types.ObjectId;
    return this.merchantModel.find({
      $or: [{ user: ObjID(userid) }, { ref: ObjID(userid) }, { 'terminals.club': ObjID(userid) }],
    });
  }

  private async getTerminalsByMerchantId(merchantid: string): Promise<any> {
    return this.merchantTerminalModel
      .find({
        $or: [{ merchant: merchantid }],
      })
      .populate('merchant');
  }

  async getTerminalInfo(terminalId: string): Promise<any> {
    return this.merchantTerminalModel
      .findOne({ _id: terminalId })
  }
  // private async getMerchantsByUserId(userId: string): Promise<any> {
  //   const merchants = await this.merchantModel.find({
  //     $or: [
  //       { user: userId },
  //       { ref: userId }
  //     ]
  //   });

  //   if (!merchants) return null;

  // }
}
