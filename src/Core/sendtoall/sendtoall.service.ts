import { BadRequestException, Injectable } from '@vision/common';
import { SendtoallCoreDto } from './dto/sendtoall.dto';
import { SendtoallCustomerclubService } from './services/customerclub.service';
import { SendtoAllAgentService } from './services/agent.service';
import { SendtoallCommonService } from './services/common.service';

@Injectable()
export class SendtoallCoreService {
  constructor(
    private readonly clubService: SendtoallCustomerclubService,
    private readonly agentService: SendtoAllAgentService,
    private readonly commonService: SendtoallCommonService
  ) {}

  async submit(getInfo: SendtoallCoreDto, users: string[], userid: string, role: string): Promise<any> {
    switch (role) {
      case 'customerclub': {
        return this.clubService.submit(userid, getInfo, users);
      }

      case 'agent': {
        return this.agentService.submit(users, getInfo, userid);
      }

      default: {
        throw new BadRequestException();
      }
    }
  }

  async getList(userid: string, page: number, gid: string): Promise<any> {
    return this.commonService.getList(userid, page, gid);
  }
}
