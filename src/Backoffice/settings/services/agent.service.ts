import { Injectable } from '@vision/common';
import { AgentsSettingsService } from '../../../Core/settings/service/agents-settings.service';
import { AgentsBackofficeSettingsDto } from '../dto/agent-settings.dto';

@Injectable()
export class AgentBackofficeSettingsService {
  constructor(private readonly agentsService: AgentsSettingsService) {}

  async Setiings(getInfo: AgentsBackofficeSettingsDto): Promise<any> {
    const data = await this.agentsService.newAgentSettings(getInfo);
    console.log(data);
    return data;
  }
}
