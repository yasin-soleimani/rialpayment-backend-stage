import { Injectable } from '@vision/common';
import { NewSwitchDto } from '../../dto/new-switch.dto';
import { CardService } from '../../../Core/useraccount/card/card.service';
import { PayCommonService } from '../../../Core/pay/services/pay-common.service';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { SwitchCreditPaymentService } from './credit/payment.credit';
import { SwitchDiscountPaymentService } from './discount/payment.closeloop';
import { MerchantcoreService } from '../../../Core/merchant/merchantcore.service';
import * as Sha256 from 'sha256';
import { SwitchDiscountConfirmService } from './discount/confirm.closeloop';
import { CreditPaymentConfirmService } from './credit/confirm.credit';
import { ShetabSwitchConfirm } from '../shetab/confirm.shetab';
import { MerchantCoreTerminalBalanceService } from '../../../Core/merchant/services/merchant-terminal-balance.service';

@Injectable()
export class CloseloopService {
  constructor(
    private readonly commonService: PayCommonService,
    private readonly accoutnService: AccountService,
    private readonly creditPayService: SwitchCreditPaymentService,
    private readonly discountPayService: SwitchDiscountPaymentService,
    private readonly discountConfirmService: SwitchDiscountConfirmService,
    private readonly balanceinStoreService: MerchantCoreTerminalBalanceService,
    private readonly cardService: CardService,
    private readonly creditConfirm: CreditPaymentConfirmService,
    private readonly shetabConfirmService: ShetabSwitchConfirm
  ) {}

  async Buy(getInfo: NewSwitchDto, terminalInfo): Promise<any> {
    // Get Card Infotmation & Card Validation
    const cardInfo = await this.cardService.getCardInfo(getInfo.CardNum);
    if (!cardInfo) {
      return this.commonService.Error(getInfo, 1, null, null, null);
    }
    if (isEmpty(cardInfo.pin)) return this.commonService.Error(getInfo, 5, cardInfo.user, null, null);
    // Check Secure pin
    let securitypin = cardInfo.secpin;
    if (isEmpty(cardInfo.secpin)) {
      securitypin = 0;
    }
    // Pin Validation
    const pindata = Sha256(cardInfo.pin);
    if (getInfo.Pin !== pindata) return this.commonService.Error(getInfo, 12, cardInfo.user);
    // Card Vakidation
    //if ( !this.commonService.checkPan(cardInfo.cardno, getInfo.Track2, securitypin)) return this.commonService.Error(getInfo, 4, cardInfo.user);
    let storeInBalance = await this.balanceinStoreService.getBalanceInStore(terminalInfo._id, cardInfo.user);
    if (!storeInBalance) storeInBalance = { amount: 0 };
    getInfo.storeinbalance = 0;

    // Check User Credit Validation
    const checkCredit = await this.accoutnService.getBalance(cardInfo.user, 'credit');
    // Select User CloseLoop Payment Operation
    switch (true) {
      // Check User & Merchant Support Credit
      case checkCredit.balance > 0 && terminalInfo.iscredit === true: {
        console.log('1');
        return this.creditPayService.Buy(getInfo, terminalInfo, cardInfo, storeInBalance);
      }

      // By Default On Discount Merchant & User
      default: {
        console.log('2');
        return await this.discountPayService.Buy(getInfo, terminalInfo, cardInfo, storeInBalance);
      }
    }
  }

  async confirm(getInfo: NewSwitchDto): Promise<any> {
    const traxData = await this.commonService.findTraxRequest(getInfo.TraxID, '');
    if (!traxData) {
      return this.commonService.Error(getInfo, 19, null, null, null);
    }
    switch (traxData.reqtype) {
      case 500:
      case 502: {
        return this.discountConfirmService.confirm(traxData, getInfo);
        break;
      }

      case 501: {
        return this.discountConfirmService.BalanceInStoreConfirm(traxData, getInfo);
        break;
      }

      case 503: {
        return this.shetabConfirmService.confirm(traxData, getInfo);
        break;
      }

      case 100:
      case 200:
      case 300:
      case 400: {
        return this.creditConfirm.creditConfirm(traxData, getInfo);
        break;
      }

      default: {
        return this.commonService.Error(getInfo, 19, null, null, null);
      }
    }
  }
}
