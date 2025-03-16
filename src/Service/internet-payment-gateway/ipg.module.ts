import { Module } from '@vision/common';
import { SwitchModule } from '../../Switch/next-generation/switch.module';
import { InternetPaymentGatewayServiceController } from './ipg.controller';
import { InternetPaymentGatewayService } from './ipg.service';
import { MerchantcoreModule } from '../../Core/merchant/merchantcore.module';
import { MipgModule } from '../../Core/mipg/mipg.module';
import { InternetPaymentGatewayGetToken } from './services/get-token.service';
import { InternetPaymentGatewayCommonService } from './services/common.service';
import { IpgCoreModule } from '../../Core/ipg/ipgcore.module';
import { InternetPaymentGatewayGetPayment } from './services/get-payment.service';
import { CardModule } from '../../Core/useraccount/card/card.module';
import { InternetPaymentGatewaySwitchConnectorService } from './services/switch-connector.service';
import { InternetPaymentGatewayCardService } from './services/card.service';
import { InternetPaymentGatewayResultService } from './services/result.service';
import { InternetPaymentGatewayVerifyService } from './services/verify.service';
import { SessionModule } from '../../Core/session/session.module';
@Module({
  imports: [SwitchModule, MerchantcoreModule, IpgCoreModule, MipgModule, CardModule, SessionModule],
  controllers: [InternetPaymentGatewayServiceController],
  providers: [
    InternetPaymentGatewayService,
    InternetPaymentGatewayCommonService,
    InternetPaymentGatewayGetPayment,
    InternetPaymentGatewayGetToken,
    InternetPaymentGatewaySwitchConnectorService,
    InternetPaymentGatewayCardService,
    InternetPaymentGatewayResultService,
    InternetPaymentGatewayVerifyService,
  ],
  exports: [InternetPaymentGatewayService],
})
export class InternetPaymentGatewayServiceModule {}
