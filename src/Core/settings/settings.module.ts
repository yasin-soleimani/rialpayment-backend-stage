import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { ClubSettingsCoreService } from './service/club-settings.service';
import { SettingsProviders } from './settings.providers';
import { AclCoreModule } from '../acl/acl.module';
import { UserModule } from '../useraccount/user/user.module';
import { AgentsSettingsService } from './service/agents-settings.service';
import { SettingsService } from './service/settings.service';
import { UserSettingsService } from './service/user-settings.service';
import { SettingsUserDeveloperService } from './service/developer-settings.service';

@Module({
  imports: [DatabaseModule, AclCoreModule, UserModule],
  providers: [
    ClubSettingsCoreService,
    AgentsSettingsService,
    UserSettingsService,
    SettingsUserDeveloperService,
    SettingsService,
    ...SettingsProviders,
  ],
  exports: [
    ClubSettingsCoreService,
    SettingsUserDeveloperService,
    SettingsService,
    UserSettingsService,
    AgentsSettingsService,
  ],
})
export class SettingsCoreModule {}
