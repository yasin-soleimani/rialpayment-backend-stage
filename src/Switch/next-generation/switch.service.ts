import { Injectable } from '@vision/common';
import { SwitchMainService } from './services/main.service';
import { SwitchRequestDto } from './dto/SwitchRequestDto';

@Injectable()
export class SwitchService {
  constructor(private readonly mainService: SwitchMainService) {}

  async action(getInfo: SwitchRequestDto): Promise<any> {
    switch (getInfo.CommandID.toString()) {
      // Payment
      case '104': {
        getInfo.TrnAmt = Number(getInfo.TrnAmt);
        return this.mainService.opt(getInfo);
      }

      // Get Remain
      case '103': {
        return this.mainService.getRemain(getInfo);
      }

      // Confirm
      case '106': {
        return this.mainService.confirm(getInfo);
      }
      // Reverse
      // case '107': {
      //   return {
      //     CommandID: 207,
      //     TraxID : getInfo.TraxID,
      //     TermID: getInfo.TermID,
      //     Merchant : getInfo.Merchant,
      //     ReceiveDT: getInfo.ReceiveDT,
      //     TermType: getInfo.termType || getInfo.TermType,
      //     TrackingCode: null,
      //     ReferenceNumber: null,
      //     Data: [],
      //     rsCode: 18,
      //   };
      // }
      default: {
      }
    }
  }
}
