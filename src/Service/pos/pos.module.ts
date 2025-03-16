import { Module } from '@vision/common';
import { MerchantcoreModule } from '../../Core/merchant/merchantcore.module';
import { PosServiceController } from './pos.controller';
import { PosService } from './pos.service';
import { PosValidateService } from './services/pos-validate.service';
import { CardModule } from '../../Core/useraccount/card/card.module';
import { PosCardService } from './services/card.service';
import { PosPaymentService } from './services/payment.service';
import { PosSwitchService } from './services/pos-switch.service';
import { PosQrScanService } from './services/qr-payment.service';
import { PaymentModule } from '../../Api/payment/payment.module';
import { PosGetRemainSrevice } from './services/get-remain.service';
import { PosQrCardScanService } from './services/qr-card.payment.service';
import { PspverifyCoreModule } from '../../Core/psp/pspverify/pspverifyCore.module';
import { PosReportService } from './services/report.service';
import { RegisterUserModule } from '../../Core/useraccount/register/register-user.module';
import { PosUserRegisterService } from './services/pos-user-register.service';
import { CardmanagementcoreModule } from '../../Core/cardmanagement/cardmanagementcore.module';

@Module({
  imports: [
    MerchantcoreModule,
    PaymentModule,
    CardModule,
    PspverifyCoreModule,
    RegisterUserModule,
    CardmanagementcoreModule,
  ],
  controllers: [PosServiceController],
  providers: [
    PosValidateService,
    PosPaymentService,
    PosSwitchService,
    PosService,
    PosCardService,
    PosQrScanService,
    PosGetRemainSrevice,
    PosQrCardScanService,
    PosReportService,
    PosUserRegisterService,
  ],
})
export class PosServiceModule {}
