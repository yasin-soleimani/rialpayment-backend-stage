import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { ClubCoreService } from './club.service';
import { ClubProviders } from './club.providers';
import { LoggercoreModule } from '../logger/loggercore.module';
import { AccountModule } from '../useraccount/account/account.module';
import { SettingsCoreModule } from '../settings/settings.module';
import { AclCoreModule } from '../acl/acl.module';
import { UserModule } from '../useraccount/user/user.module';
import { CardModule } from '../useraccount/card/card.module';

@Module({
  imports: [DatabaseModule, LoggercoreModule, AccountModule, SettingsCoreModule, AclCoreModule, UserModule, CardModule],
  providers: [ClubCoreService, ...ClubProviders],
  exports: [ClubCoreService],
})
export class ClubCoreModule {}
