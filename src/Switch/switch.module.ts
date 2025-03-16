import { Module } from '@vision/common';
import { DatabaseModule } from '../Database/database.module';
import { NewSwitchController } from './switch.controller';
import { NewSwitchService } from './switch.service';
import { SwitchCreditPaymentService } from './services/closeloop/credit/payment.credit';
import { SwitchDiscountPaymentService } from './services/closeloop/discount/payment.closeloop';
import { switchOperationService } from './services/switch-buy.service';
import { PayCommonService } from '../Core/pay/services/pay-common.service';
import { MerchantcoreModule } from '../Core/merchant/merchantcore.module';
import { AccountModule } from '../Core/useraccount/account/account.module';
import { ShetabPaymentService } from './services/shetab/payment.shetab';
import { CloseloopService } from './services/closeloop/closeloop.service';
import { PspverifyCoreModule } from '../Core/psp/pspverify/pspverifyCore.module';
import { CardModule } from '../Core/useraccount/card/card.module';
import { SwitchDiscountConfirmService } from './services/closeloop/discount/confirm.closeloop';
import { LoggercoreModule } from '../Core/logger/loggercore.module';
import { CardmanagementcoreModule } from '../Core/cardmanagement/cardmanagementcore.module';
import { PayCoreModule } from '../Core/pay/payaction.module';
import { MerchantCreditCoreModule } from '../Core/credit/merchantcredit/merchantcredit.module';
import { CreditHistoryCoreModule } from '../Core/credit/history/credit-history.module';
import { UserCreditCoreModule } from '../Core/credit/usercredit/credit-core.module';
import { CreditPaymentConfirmService } from './services/closeloop/credit/confirm.credit';
import { GetRemainService } from './services/closeloop/getremain.service';
import { ShetabSwitchConfirm } from './services/shetab/confirm.shetab';
import { DiscountSwitchReverseService } from './services/closeloop/discount/reverse.clooseloop';
import { CreditSwitchReverseService } from './services/closeloop/credit/reverse.credit';
import { ShetabSwitchReverseService } from './services/shetab/reverse.shetab';

@Module({
  imports: [
    DatabaseModule,
    MerchantcoreModule,
    AccountModule,
    PspverifyCoreModule,
    CardModule,
    LoggercoreModule,
    CardmanagementcoreModule,
    PayCoreModule,
    MerchantCreditCoreModule,
    CreditHistoryCoreModule,
    UserCreditCoreModule,
  ],
  controllers: [NewSwitchController],
  providers: [
    NewSwitchService,
    SwitchCreditPaymentService,
    SwitchDiscountPaymentService,
    switchOperationService,
    SwitchDiscountConfirmService,
    PayCommonService,
    ShetabPaymentService,
    CloseloopService,
    CreditPaymentConfirmService,
    GetRemainService,
    ShetabSwitchConfirm,
    DiscountSwitchReverseService,
    CreditSwitchReverseService,
    ShetabSwitchReverseService,
  ],
  exports: [NewSwitchService],
})
export class NewSwitchModule {}
