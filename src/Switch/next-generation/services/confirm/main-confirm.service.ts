import { Injectable } from '@vision/common';
import { SwitchDiscountConfirmService } from './discount-confirm.service';
import { SwitchShetabConfirmService } from './shetab-confirm.service';
import { SwitchCreditConfirmService } from './credit-confirm.service';
import { SwitchRequestDto } from '../../dto/SwitchRequestDto';
import { PayCommonService } from '../../../../Core/pay/services/pay-common.service';
import { MerchantCoreTerminalService } from '../../../../Core/merchant/services/merchant-terminal.service';

@Injectable()
export class SwitchMainConfirmService {
  constructor(
    private readonly dicountService: SwitchDiscountConfirmService,
    private readonly shetabService: SwitchShetabConfirmService,
    private readonly merchantTerminalService: MerchantCoreTerminalService,
    private readonly creditService: SwitchCreditConfirmService,
    private readonly commonService: PayCommonService
  ) {}

  async setConfirm(getInfo: SwitchRequestDto): Promise<any> {
    const terminalInfo = await this.merchantTerminalService.getTerminalInfoByTerminalid(getInfo.TermID);
    if (!terminalInfo) {
      return this.commonService.Error(getInfo, 1, null, null, null);
    }
    const traxData = await this.commonService.findTraxRequest(getInfo.TraxID, terminalInfo._id);
    if (!traxData) {
      return this.commonService.Error(getInfo, 19, null, null, null);
    }
    switch (traxData.reqtype) {
      case 500:
      case 900:
      case 901:
      case 902:
      case 502: {
        return this.dicountService.confirm(traxData, getInfo);
      }

      case 501: {
        return this.dicountService.BalanceInStoreConfirm(traxData, getInfo);
      }

      case 503: {
        return this.shetabService.confirm(traxData, getInfo);
      }

      case 800: {
        return this.dicountService.confirmCardPayWallet(traxData, getInfo);
      }

      case 100:
      case 200:
      case 300:
      case 400: {
        return this.creditService.confirm(traxData, getInfo);
      }

      case 1001: {
        return this.dicountService.confirmLeasing(traxData, getInfo);
      }

      default: {
        return this.commonService.Error(getInfo, 19, null, null, null);
      }
    }
  }
}
