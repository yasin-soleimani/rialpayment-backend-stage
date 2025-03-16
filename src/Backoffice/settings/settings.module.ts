import { Module } from '@vision/common';
import { SettingsClubService } from './services/club.service';
import { SettingsService } from './services/settings.service';
import { SettingsController } from './settings.controller';
import { SettingsCoreModule } from '../../Core/settings/settings.module';
import { AgentBackofficeSettingsService } from './services/agent.service';

@Module({
  imports: [SettingsCoreModule],
  providers: [SettingsClubService, SettingsService, AgentBackofficeSettingsService],
  controllers: [SettingsController],
  exports: [],
})
export class SettingsModule {}
