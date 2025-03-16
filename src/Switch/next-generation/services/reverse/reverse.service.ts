import { Injectable } from '@vision/common';
import { SwitchRequestDto } from '../../dto/SwitchRequestDto';
import { MerchantCoreTerminalService } from '../../../../Core/merchant/services/merchant-terminal.service';
import { PayCommonService } from '../../../../Core/pay/services/pay-common.service';
import { PspverifyCoreService } from '../../../../Core/psp/pspverify/pspverifyCore.service';
import { AccountService } from '../../../../Core/useraccount/account/account.service';
import { CardService } from '../../../../Core/useraccount/card/card.service';

@Injectable()
export class SwitchReverseService {
  constructor(
    private readonly merchantTerminalService: MerchantCoreTerminalService,
    private readonly commonService: PayCommonService,
    private readonly pspverifyService: PspverifyCoreService,
    private readonly accountService: AccountService,
    private readonly cardService: CardService
  ) {}

  async play(getInfo: SwitchRequestDto): Promise<any> {
    const terminalInfo = await this.merchantTerminalService.getTerminalInfoByTerminalid(getInfo.TermID);
    if (!terminalInfo) {
      return this.commonService.Error(getInfo, 1, null, null, null);
    }
    const traxData = await this.commonService.findTraxRequest(getInfo.TraxID, terminalInfo._id);
    if (!traxData) {
      return this.commonService.Error(getInfo, 19, null, null, null);
    }
    if (traxData.confirm === true || traxData.reverse === true) {
      return this.commonService.Error(getInfo, 15, null, ' ', ' ');
    }

    switch (traxData.reqtype) {
      case 500:
      case 502: {
        return this.reverseDiscount(traxData, getInfo);
      }

      case 800: {
        return this.giftCardReverse(traxData, getInfo);
      }

      default: {
        return this.commonService.Error(getInfo, 19, null, null, null);
      }
    }
  }

  async reverseDiscount(traxData, getInfo): Promise<any> {
    const reverse = await this.pspverifyService.reverse(traxData.TraxID);

    if (reverse) {
      const cardInfo = await this.cardService.getCardInfo(traxData.cardno);

      const mtitle = 'برگشت وجه از خرید ترمینال ' + traxData.terminal.terminalid;
      this.accountService.accountSetLogg(mtitle, 'Pos', traxData.discount.amount, true, null, cardInfo.user._id);
      this.accountService.chargeAccount(cardInfo.user._id, 'wallet', traxData.discount.amount);
      return this.commonService.setDataCloseLoop(getInfo, null, null, null, 18);
    } else {
      return this.commonService.Error(getInfo, 10, traxData.user.id);
    }
  }

  async giftCardReverse(traxData, getInfo): Promise<any> {
    const reverse = await this.pspverifyService.reverse(traxData.TraxID);
    if (reverse) {
      const cardInfo = await this.cardService.getCardInfo(traxData.cardno);
      if (cardInfo.cardno != traxData.cardno) return this.commonService.Error(getInfo, 10, traxData.user.id);
      this.cardService.chargeCard(cardInfo._id, traxData.discount.amount);

      return this.commonService.setDataCloseLoop(getInfo, null, null, null, 18);
    } else {
      return this.commonService.Error(getInfo, 10, traxData.user.id);
    }
  }
}
