import { Module } from '@vision/common';
import { AccountService } from './account.service';
import { AccountProviders } from './account.providers';
import { CardcounterProviders } from '../cardcounter/cardcounter.providers';
import { DatabaseModule } from '../../../Database/database.module';
import { GeneralService } from '../../service/general.service';
import { SafeboxCoreModule } from '../../safebox/safebox.module';
import { LoggercoreModule } from '../../logger/loggercore.module';
import { UserModule } from '../user/user.module';
import { CardcounterModule } from '../cardcounter/cardcounter.module';
import { AccountBlockService } from './services/account-block.service';
import { GlobalClubModule } from '../../global-club/global-club.module';
import { ClubCoreModule } from '../../customerclub/club.module';

@Module({
  imports: [DatabaseModule, SafeboxCoreModule, LoggercoreModule, CardcounterModule, UserModule, GlobalClubModule],
  controllers: [],
  providers: [AccountService, AccountBlockService, GeneralService, ...AccountProviders, ...CardcounterProviders],
  exports: [AccountService, AccountBlockService],
})
export class AccountModule {}
