import { Injectable, InternalServerErrorException, successOptWithDataNoValidation } from '@vision/common';
import { InAppPurchaseCoreService } from '../../../Core/in-app-purchase/in-app-purchase.service';
import { BasketStoreCoreService } from '../../../Core/basket/store/basket-store.service';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { CardService } from '../../../Core/useraccount/card/card.service';
import { MerchantcoreService } from '../../../Core/merchant/merchantcore.service';
import { MerchantCoreTerminalService } from '../../../Core/merchant/services/merchant-terminal.service';
import { VitrinPaymentSettlementApiService } from '../../basket/vitrin/payment/settlement.service';
import { DeliveryTimeService } from '../../../Core/basket/delivery-time/delivery-time.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { Messages } from '@vision/common/constants/messages.const';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { inAppPurchaseModel } from '../../../Core/in-app-purchase/function/in-app-purchase.model';
import * as Sha256 from 'sha256';
import { MipgCoreService } from '../../../Core/mipg/mipg.service';
import { get } from 'mongoose';
import { TaxiSettlementService } from './settlements';

@Injectable()
export class TaxiInAppPurchaseApiService {
  constructor(
    private readonly purchaseService: InAppPurchaseCoreService,
    private readonly userService: UserService,
    private readonly cardService: CardService,
    private readonly merchantService: MerchantcoreService,
    private readonly terminalService: MerchantCoreTerminalService,
    private readonly mipgCoreService: MipgCoreService,
    private readonly settlement: TaxiSettlementService
  ) {}

  async action(getInfo, sepidPan, userInfo): Promise<any> {
    const info = await this.checkPayment(getInfo);
    const mipg = await this.mipgCoreService.getInfoByTerminalId(Number(process.env.IN_APP_PURCHASE_TAXI_IPG));
    const switchTerminalInfo = await this.checkTerminal(mipg.terminal._id);
    const model = this.getModel(info, getInfo, switchTerminalInfo.terminal, switchTerminalInfo.acceptor, {
      payInfo: getInfo,
      sepidPan,
    });
    const result = await this.purchaseService.getPayment(model);

    if (!result) throw new InternalServerErrorException();
    if (result.success == false) throw new UserCustomException('خطا در تراکنش');
    if (result.success == true && result.ipg == true) {
      const token = result.token;
      return {
        status: 200,
        success: true,
        message: Messages.success.opt,
        token,
      };
    } else if (result.success == true && result.ipg == false) {
      delete getInfo.user;
      await this.settlement.taxiSettlement(getInfo, sepidPan, userInfo);
      const data = {
        success: true,
        status: true,
        amount: result.result.TrnAmt,
        refid: result.result.TraxID,
      };
      return successOptWithDataNoValidation(data);
    } else {
      throw new UserCustomException('خطا در تراکنش');
    }
  }

  private async checkPayment(getInfo): Promise<any> {
    const cardInfo = await this.cardService.getCardByUserID(getInfo.user);
    if (!cardInfo) throw new UserCustomException('خطا در تراکنش');
    if (cardInfo.pin == '') throw new UserCustomException('رمز کارت نامعتبر');
    const pin = Sha256(cardInfo.pin);
    // if (getInfo.pin != pin) throw new UserCustomException('رمز کارت نامعتبر');

    return {
      cardInfo,
      pin,
    };
  }

  private getModel(info, getInfo, terminalId, acceptorCode, payload) {
    const model = inAppPurchaseModel(
      getInfo.user,
      terminalId,
      acceptorCode,
      process.env.IN_APP_PURCHASE_TAXI_IPG,
      process.env.IN_APP_PURCHASE_TAXI_CALLBACK,
      getInfo.amount,
      info.cardInfo,
      payload,
      'InAppPurchaseTaxi-',
      ' پرداخت کرایه تاکسی',
      false,
      info.pin
    );

    return model;
  }

  private async checkTerminal(terminalId: string): Promise<any> {
    const terminalInfo = await this.terminalService.getInfoByID(terminalId);
    if (!terminalInfo) throw new UserCustomException('پرداخت درون برنامه ای غیرفعال می باشد');
    if (terminalInfo.status == false) throw new UserCustomException('پرداخت درون برنامه ای غیرفعال می باشد');

    const merchantInfo = await this.merchantService.findMerchantByID(terminalInfo.merchant);
    if (!merchantInfo) throw new UserCustomException('پرداخت درون برنامه ای غیرفعال می باشد');

    if (merchantInfo.status == false) throw new UserCustomException('پرداخت درون برنامه ای غیرفعال می باشد');

    return {
      terminal: terminalInfo.terminalid,
      acceptor: merchantInfo.merchantcode,
    };
  }
}
