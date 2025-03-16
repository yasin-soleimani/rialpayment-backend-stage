import { Controller, Post, Body, Req } from '@vision/common';
import { SettingsClubDto } from './dto/club-settings.dto';
import { SettingsClubService } from './services/club.service';
import { AgentsBackofficeSettingsDto } from './dto/agent-settings.dto';
import { AgentBackofficeSettingsService } from './services/agent.service';

@Controller('settings')
export class SettingsController {
  constructor(
    private readonly clubService: SettingsClubService,
    private readonly agentService: AgentBackofficeSettingsService
  ) {}

  @Post('club')
  async updateClub(@Body() getInfo: SettingsClubDto): Promise<any> {
    return this.clubService.udpateSettings(getInfo);
  }

  @Post('agent')
  async agentsSetiings(@Body() getInfo: AgentsBackofficeSettingsDto, @Req() req): Promise<any> {
    return this.agentService.Setiings(getInfo);
  }
}
