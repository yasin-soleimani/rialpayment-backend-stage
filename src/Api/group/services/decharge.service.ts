import { Injectable, successOpt } from '@vision/common';
import { GroupCoreDechargeService } from '../../../Core/group/services/group-decharge.service';

@Injectable()
export class GroupApiDechargeService {
  constructor(private readonly dechargeService: GroupCoreDechargeService) {}

  async WalletDechargeGroup(userid: string, gid: string, amount: number): Promise<any> {
    this.dechargeService.dechargeGroupUsers(gid, amount, userid);
    return successOpt();
  }
}
