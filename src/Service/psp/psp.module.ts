import { Module } from '@vision/common';
import { PspController } from './psp.controller';
import { DatabaseModule } from '../../Database/database.module';
import { PaymentCoreService } from '../../Core/payment/payment.service';
import { PaymentProviders } from '../../Core/payment/payment.providers';
import { PspService } from './psp.service';
import { CardmanagementcoreService } from '../../Core/cardmanagement/cardmanagementcore.service';
import { SoapHamidService } from './services/soap-hamid.service';
import { CardmanagementcoreProviders } from '../../Core/cardmanagement/cardmanagementcore.providers';
import { UserService } from '../../Core/useraccount/user/user.service';
import { UserProviders } from '../../Core/useraccount/user/user.providers';
import { GeneralService } from '../../Core/service/general.service';
import { PspCoreService } from '../../Core/psp/psp/pspCore.service';
import { PspCoreProviders } from '../../Core/psp/psp/pspCore.providers';
import { CardcounterService } from '../../Core/useraccount/cardcounter/cardcounter.service';
import { CardcounterProviders } from '../../Core/useraccount/cardcounter/cardcounter.providers';
import { CardService } from '../../Core/useraccount/card/card.service';
import { CardProviders } from '../../Core/useraccount/card/card.providers';
import { MerchantcoreService } from '../../Core/merchant/merchantcore.service';
import { MerchantcoreProviders } from '../../Core/merchant/merchantcore.providers';
import { PspverifyCoreService } from '../../Core/psp/pspverify/pspverifyCore.service';
import { PspverifyCoreProviders } from '../../Core/psp/pspverify/pspverifyCore.providers';
import { DispatcherCoreService } from '../../Core/dispatcher/dispatcher.service';
import { DispatcherCoreProviders } from '../../Core/dispatcher/dispatcher.providers';
import { LoggercoreService } from '../../Core/logger/loggercore.service';
import { LoggercoreProviders } from '../../Core/logger/loggercore.providers';
import { PayCommonService } from '../../Core/pay/services/pay-common.service';
import { MerchantCreditCoreService } from '../../Core/credit/merchantcredit/merchantcredit.service';
import { UserCreditCoreService } from '../../Core/credit/usercredit/credit-core.service';
import { UserCreditCoreProviders } from '../../Core/credit/usercredit/credit-core.providers';
import { CreditHistoryCoreService } from '../../Core/credit/history/credit-history.service';
import { CreditHistoryProviders } from '../../Core/credit/history/credit-history.providers';
import { merchantCreditProviders } from '../../Core/credit/merchantcredit/merchantcredit.providers';
import { NewSwitchModule } from '../../Switch/switch.module';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { SwitchModule } from '../../Switch/next-generation/switch.module';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { MerchantcoreModule } from '../../Core/merchant/merchantcore.module';

@Module({
  imports: [DatabaseModule, NewSwitchModule, AccountModule, SwitchModule, UserModule, MerchantcoreModule],
  controllers: [PspController],
  providers: [
    PspCoreService,
    CardcounterService,
    CardmanagementcoreService,
    PaymentCoreService,
    SoapHamidService,
    CardService,
    PspService,
    GeneralService,
    PspverifyCoreService,
    DispatcherCoreService,
    LoggercoreService,
    PayCommonService,
    CreditHistoryCoreService,
    MerchantCreditCoreService,
    UserCreditCoreService,
    ...CardcounterProviders,
    ...CardProviders,
    ...PspverifyCoreProviders,
    ...CreditHistoryProviders,
    ...merchantCreditProviders,
    ...UserCreditCoreProviders,
    ...PaymentProviders,
    ...CardmanagementcoreProviders,
    ...PspCoreProviders,
    ...DispatcherCoreProviders,
    ...LoggercoreProviders,
  ],
})
export class PspModule {}
