import { Injectable } from '@vision/common';
import { InternetPaymentGatewayGetToken } from './services/get-token.service';
import { InternetPaymentGatewayGetPayment } from './services/get-payment.service';
import { InternetPaymentGatewaySwitchConnectorService } from './services/switch-connector.service';
import { InternetPaymentGatewayResultService } from './services/result.service';
import { InternetPaymentGatewayVerifyService } from './services/verify.service';

@Injectable()
export class InternetPaymentGatewayService {
  constructor(
    private readonly getTokenService: InternetPaymentGatewayGetToken,
    private readonly getPaymentService: InternetPaymentGatewayGetPayment,
    private readonly switchConnectorService: InternetPaymentGatewaySwitchConnectorService,
    private readonly resultService: InternetPaymentGatewayResultService,
    private readonly verifyService: InternetPaymentGatewayVerifyService
  ) {}

  async getToken(getInfo, req): Promise<any> {
    return this.getTokenService.getToken(getInfo, req);
  }

  async getPayment(getInfo, session): Promise<any> {
    return this.getPaymentService.getPaymentInfo(getInfo.token, session);
  }

  async getPaymentApi(getInfo): Promise<any> {
    return this.switchConnectorService.getSwitch(getInfo);
  }

  async cancelTransaction(token: string): Promise<any> {
    return this.switchConnectorService.cancelTransaction(token);
  }

  async showResult(token, res): Promise<any> {
    return this.resultService.getInfo(token, res);
  }

  async verifyPayment(token, req): Promise<any> {
    return this.verifyService.submit(token, req);
  }
}
