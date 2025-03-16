import { Inject, Injectable } from '@vision/common';
import { Model } from 'mongoose';
import { AgentsCoreSettingsDto } from '../dto/agents-settings.dto';
import { UserService } from '../../useraccount/user/user.service';
import { AclCoreService } from '../../acl/acl.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';

@Injectable()
export class AgentsSettingsService {
  constructor(
    @Inject('SettingsAgentModel') private readonly agentsSettingsModel: Model<any>,
    private readonly userService: UserService,
    private readonly aclService: AclCoreService
  ) {}

  async newAgentSettings(getInfo: AgentsCoreSettingsDto): Promise<any> {
    const agentData = await this.userService.isAgent(getInfo.user);
    if (isEmpty(agentData)) throw new UserNotfoundException();
    return this.agentsSettingsModel.findOneAndUpdate({ user: getInfo.user }, getInfo, { new: true, upsert: true });
  }

  async getSettings(userid): Promise<any> {
    return this.agentsSettingsModel.findOne({ user: userid });
  }
}
