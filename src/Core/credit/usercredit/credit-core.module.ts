import { Module } from '@vision/common';
import { UserCreditCoreService } from './credit-core.service';
import { UserCreditCoreProviders } from './credit-core.providers';
import { DatabaseModule } from '../../../Database/database.module';
import { AccountModule } from '../../useraccount/account/account.module';
import { LoggercoreModule } from '../../logger/loggercore.module';
import { GeneralService } from '../../service/general.service';
import { UserModule } from '../../useraccount/user/user.module';

@Module({
  imports: [DatabaseModule, AccountModule, LoggercoreModule, UserModule],
  controllers: [],
  providers: [UserCreditCoreService, GeneralService, ...UserCreditCoreProviders],
  exports: [UserCreditCoreService],
})
export class UserCreditCoreModule {}
