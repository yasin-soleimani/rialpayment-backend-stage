import { Injectable, InternalServerErrorException } from "@vision/common";
import * as Sha256 from 'sha256';
import { UserCustomException } from "@vision/common/exceptions/userCustom.exception";
import { ShaparakTerminalTypeConst } from "../../../Service/internet-payment-gateway/const/terminal-type.const";
import { InternetPaymentGatewaySwitchFormatFunction } from "../../../Service/internet-payment-gateway/function/switch-format.func";
import { SwitchService } from "../../../Switch/next-generation/switch.service";
import { LoggercoreService } from "../../logger/loggercore.service";
import { PspverifyCoreService } from "../../psp/pspverify/pspverifyCore.service";
import { InAppPurchasePaymentDto } from "../dto/paymend-details.dto";
import { InAppPurchaseIpgCoreService } from "./ipg.service";

@Injectable()
export class InAppPurchaseSwitchCoreService {

  constructor(
    private readonly switchService: SwitchService,
    private readonly ipgService: InAppPurchaseIpgCoreService,
    private readonly loggerService: LoggercoreService,
    private readonly pspVerifyService: PspverifyCoreService
  ) { }

  async payment(getInfo: InAppPurchasePaymentDto): Promise<any> {

    const switchReq = InternetPaymentGatewaySwitchFormatFunction(
      104,
      new Date().getTime(),
      getInfo.cardInfo.cardno,
      getInfo.cardInfo.track2 + '=' + getInfo.cardInfo.secpin,
      getInfo.terminalId,
      getInfo.acceptorCode,
      new Date(),
      getInfo.amount,
      getInfo.pin,
      ShaparakTerminalTypeConst.InApp
    );

    const res = await this.switchService.action(switchReq);
    return this.resultSwitch(res, getInfo, getInfo.pin);

  }


  private async resultSwitch(result, getInfo: InAppPurchasePaymentDto, pin: string): Promise<any> {
    console.log(' IN App purchase Log :::::', result)
    if (result.CommandID == 204 && result.rsCode == 20) {
      // verify Payment
      return this.verify(result, pin, getInfo);

    } else if (result.CommandID == 204 && result.rsCode == 11) {
      // redirect to Ipg
      const data = await this.ipgService.getTokenIpg(getInfo)
      return {
        success: true,
        ipg: true,
        token: data,
        callback: getInfo.ipgCallback,
      }
    } else {
      throw new UserCustomException('خطا در تراکنش');
    }
  }

  private async verify(info, pin: string, getInfo: InAppPurchasePaymentDto): Promise<any> {
    const switchReq = InternetPaymentGatewaySwitchFormatFunction(
      106,
      info.TraxID,
      info.CardNum,
      info.CardNum,
      info.TermID,
      info.Merchant,
      new Date(),
      info.TrnAmt,
      pin,
      ShaparakTerminalTypeConst.Internet
    );
    const switchResult = await this.switchService.action(switchReq);
    console.log(' IN App purchase verify Log :::::', switchResult)

    const result = this.rsSwitch(switchResult.rsCode);
    if (!result) throw new InternalServerErrorException();

    const pspInfo = await this.pspVerifyService.getTraxInfoByTraxIdWithLog(info.TraxID);
    const ref = getInfo.paymentPrefix + new Date().getTime();
    this.loggerService.updateLogWithQueryAndId(pspInfo.log._id, {
      $set: {
        ref: ref,
        title: getInfo.paymentLogTitle
      },
    });

    return {
      success: true,
      ipg: false,
      token: null,
      callback: getInfo.ipgCallback,
      result: info
    }
  }

  private rsSwitch(rscode) {
    switch (rscode) {
      case 17: {
        return true;
      }

      default: {
        return false;
      }
    }
  }
}