import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { BackofficeUserCreditController } from './backoffice-usercredit.controller';
import { UserCreditCoreService } from '../../Core/credit/usercredit/credit-core.service';
import { UserCreditCoreProviders } from '../../Core/credit/usercredit/credit-core.providers';
import { BackofficeUserCreditService } from './backoffice-usercredit.service';
import { GeneralService } from '../../Core/service/general.service';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { LoggercoreModule } from '../../Core/logger/loggercore.module';
import { UserCreditCoreModule } from '../../Core/credit/usercredit/credit-core.module';

@Module({
  imports: [DatabaseModule, AccountModule, LoggercoreModule, UserCreditCoreModule],
  controllers: [BackofficeUserCreditController],
  providers: [GeneralService, BackofficeUserCreditService],
})
export class BackofficeUserCreditModule {}
