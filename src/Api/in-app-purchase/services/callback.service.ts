import { Injectable, InternalServerErrorException } from "@vision/common";
import { UserCustomException } from "@vision/common/exceptions/userCustom.exception";
import { inAppPurchaseModel } from "../../../Core/in-app-purchase/function/in-app-purchase.model";
import { InAppPurchaseCoreService } from "../../../Core/in-app-purchase/in-app-purchase.service";
import { IpgCoreService } from "../../../Core/ipg/ipgcore.service";
import { AccountService } from "../../../Core/useraccount/account/account.service";
import { InAppPurchaseCallbackFunction } from "../function/callback.func";

@Injectable()
export class InAppPurcahseIpgCallBackApiService {

  constructor(
    private readonly ipgService: IpgCoreService,
    private readonly accountService: AccountService,
    private readonly paymentService: InAppPurchaseCoreService
  ) { }

  async callback(getInfo, res): Promise<any> {
    const payInfo = await this.ipgService.getTraxInfo(getInfo.terminalid, getInfo.ref);
    if (!payInfo) throw new UserCustomException('تراکنش یافت نشد');
    let parsed;

    if (payInfo.payload && payInfo.payload.length > 1) {
      parsed = JSON.parse(payInfo.payload);
    } else {
      throw new UserCustomException('تراکنش با خطا مواجه شده است', false, 500);
    }

    let amount = payInfo.amount;
    if (payInfo.total) {
      amount = payInfo.total;
    }

    if (getInfo.respcode == 0) {
      const verify = await this.ipgService.verify(getInfo.terminalid, payInfo.userinvoice);
      if (!verify) throw new InternalServerErrorException();

      if (verify.status == 0 && verify.success == true) {
        const title = 'شارژ کیف پول';

        if (payInfo.retry < 2) {
          await this.accountService.chargeAccount(parsed.userId, 'wallet', amount);
          this.accountService.accountSetLoggWithRef(title, payInfo.invoiceid, payInfo.total, true, null, parsed.user);

        }

        const result = await this.paymentService.getPayment(parsed);
        if (!result || result?.success == false || result?.ipg == true) throw new InternalServerErrorException();

        return InAppPurchaseCallbackFunction(res, parsed, result.result.rsCode, result.result.TraxID);
      } else {
        return InAppPurchaseCallbackFunction(res, parsed, 0, null);
      }
    } else {
      return InAppPurchaseCallbackFunction(res, parsed, 0, null);
    }
  }
}