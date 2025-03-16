import { Injectable, InternalServerErrorException, successOptWithDataNoValidation } from '@vision/common';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { BasketStoreCoreService } from '../../../../Core/basket/store/basket-store.service';
import { inAppPurchaseModel } from '../../../../Core/in-app-purchase/function/in-app-purchase.model';
import { InAppPurchaseCoreService } from '../../../../Core/in-app-purchase/in-app-purchase.service';
import { CardService } from '../../../../Core/useraccount/card/card.service';
import { UserService } from '../../../../Core/useraccount/user/user.service';
import * as Sha256 from 'sha256';
import { InAppPurchaseVitrinPayloadFunction } from '../function/purchase.function';
import { MerchantcoreService } from '../../../../Core/merchant/merchantcore.service';
import { MerchantCoreTerminalService } from '../../../../Core/merchant/services/merchant-terminal.service';
import { VitrinPaymentSettlementApiService } from '../payment/settlement.service';
import { Messages } from '@vision/common/constants/messages.const';
import { DeliveryTimeService } from '../../../../Core/basket/delivery-time/delivery-time.service';

@Injectable()
export class VitrinInAppPurchaseApiService {
  constructor(
    private readonly purchaseService: InAppPurchaseCoreService,
    private readonly storeService: BasketStoreCoreService,
    private readonly userService: UserService,
    private readonly cardService: CardService,
    private readonly merchantService: MerchantcoreService,
    private readonly terminalService: MerchantCoreTerminalService,
    private readonly settlementService: VitrinPaymentSettlementApiService,
    private readonly deliveryTimeCoreService: DeliveryTimeService
  ) {}

  async action(getInfo, storeInfo, res): Promise<any> {
    const info = await this.checkPayment(getInfo);
    const switchTerminalInfo = await this.checkTerminal(getInfo.mipg.terminal);

    const model = this.getModel(
      info,
      getInfo,
      storeInfo,
      switchTerminalInfo.terminal,
      switchTerminalInfo.acceptor,
      InAppPurchaseVitrinPayloadFunction(res._id, getInfo, storeInfo)
    );

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
      const deliveryData = await this.deliveryTimeCoreService.getById(res.deliveryTime);
      res.deliveryTime = deliveryData;
      const userData = await this.userService.getInfoByUserid(res.user);
      res.user = userData;
      const deliveryTime = await this.settlementService.actionInAppPurchase(res, result.result.TraxID, storeInfo);
      const data = {
        success: true,
        status: true,
        amount: result.result.TrnAmt,
        refid: result.result.TraxID,
        deliveryTime: deliveryTime,
        type: 2,
      };
      return successOptWithDataNoValidation(data);
    } else {
      throw new UserCustomException('خطا در تراکنش');
    }
  }

  private async checkPayment(getInfo): Promise<any> {
    const userInfo = await this.userService.getInfoByAccountNo(getInfo.account_no);
    if (!userInfo) throw new UserNotfoundException();

    const storeInfo = await this.storeService.getInfo(userInfo._id);
    if (!storeInfo) throw new UserCustomException('فروشگاه یافت نشد', false, 404);

    if (storeInfo.status === false) throw new UserCustomException('فروشگاه غیرفعال می باشد');
    if (storeInfo.mipg === null || !storeInfo.mipg) throw new UserCustomException('درگاه غیر فعال می باشد');
    if (storeInfo.mipg.status === false) throw new UserCustomException('درگاه غیر فعال می باشد');

    const cardInfo = await this.cardService.getCardByUserID(getInfo.user);
    if (!cardInfo) throw new UserCustomException('خطا در تراکنش');
    if (cardInfo.pin == '') throw new UserCustomException('رمز کارت نامعتبر');
    const pin = Sha256(cardInfo.pin);
    // if (getInfo.pin != pin) throw new UserCustomException('رمز کارت نامعتبر');

    return {
      userInfo,
      storeInfo,
      cardInfo,
      pin,
    };
  }

  private getModel(info, getInfo, storeInfo, terminalId, acceptorCode, payload) {
    const model = inAppPurchaseModel(
      getInfo.user,
      terminalId,
      acceptorCode,
      process.env.IN_APP_PURCHASE_SHOP_IPG,
      process.env.IN_APP_PURCHASE_VITRIN_CALLBACK,
      getInfo.amount,
      info.cardInfo,
      payload,
      'InAppPurchase-',
      ' خرید از فروشگاه' + ' ' + storeInfo.title,
      false,
      info.pin
    );

    return model;
  }

  private async checkTerminal(terminalId: string): Promise<any> {
    const terminalInfo = await this.terminalService.getInfoByID(terminalId);
    console.log(terminalInfo, 'terminalInfo');
    if (!terminalInfo) throw new UserCustomException('پرداخت درون برنامه ای برای این فروشگاه غیرفعال می باشد');
    if (terminalInfo.status == false)
      throw new UserCustomException('پرداخت درون برنامه ای برای این فروشگاه غیرفعال می باشد');

    const merchantInfo = await this.merchantService.findMerchantByID(terminalInfo.merchant);
    if (!merchantInfo) throw new UserCustomException('پرداخت درون برنامه ای برای این فروشگاه غیرفعال می باشد');
    console.log(merchantInfo, 'merchantInfo');

    if (merchantInfo.status == false)
      throw new UserCustomException('پرداخت درون برنامه ای برای این فروشگاه غیرفعال می باشد');

    return {
      terminal: terminalInfo.terminalid,
      acceptor: merchantInfo.merchantcode,
    };
  }
}
