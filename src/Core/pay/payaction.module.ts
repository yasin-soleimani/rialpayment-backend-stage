import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { AccountModule } from '../useraccount/account/account.module';
import { PayCommonService } from './services/pay-common.service';
import { PayCreditService } from './services/pay-credit.service';
import { MerchantcoreModule } from '../merchant/merchantcore.module';
import { PspverifyCoreModule } from '../psp/pspverify/pspverifyCore.module';
import { CardModule } from '../useraccount/card/card.module';
import { LoggercoreModule } from '../logger/loggercore.module';
import { CardmanagementcoreModule } from '../cardmanagement/cardmanagementcore.module';
import { CreditHistoryCoreModule } from '../credit/history/credit-history.module';
import { UserCreditCoreModule } from '../credit/usercredit/credit-core.module';
@Module({
  imports: [
    DatabaseModule,
    MerchantcoreModule,
    AccountModule,
    PspverifyCoreModule,
    CardModule,
    LoggercoreModule,
    CardmanagementcoreModule,
    CreditHistoryCoreModule,
    UserCreditCoreModule,
  ],
  controllers: [],
  providers: [PayCommonService, PayCreditService],
  exports: [PayCommonService, PayCreditService],
})
export class PayCoreModule {}
