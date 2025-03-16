import { Injectable } from '@vision/common';
import { OrganizationPoolCoreService } from '../../../../../Core/organization/pool/pool.service';
import { GroupCoreService } from '../../../../../Core/group/group.service';
import { OrganizationNewChargeCoreService } from '../../../../../Core/organization/new-charge/charge.service';

@Injectable()
export class NewOrganizationSwitchCommonService {
  constructor(
    private readonly groupService: GroupCoreService,
    private readonly poolService: OrganizationPoolCoreService,
    private readonly orgService: OrganizationNewChargeCoreService,
    private readonly orgChargeService: OrganizationNewChargeCoreService,

  ) { }

  async checkPoolByUserId(userid: string, amount: number): Promise<any> {
    const pools = await this.orgService.getPoolsByUserId(userid);

    if (pools.length < 1) return false;

    let current = null;
    let userBalance = 0;
    for (const item of pools) {

      const last = await this.poolService.getLastTurnOver(item._id);
      if (last) {
        if (!current) {
          const user = await this.orgChargeService.getUserBalance(userid, last.pool);
          if (user) {
            if (user.remain >= userBalance) {
              userBalance = user.remain;
              current = last;
            }
          }

        } else if (current.remain >= amount) {
          const user = await this.orgChargeService.getUserBalance(userid, last.pool);
          if (user) {
            if (user.remain >= userBalance) {
              userBalance = user.remain;
              current = last;
            }
          }
        }
      }

    }

    if (!current) {
      const groupInfo = await this.groupService.getGroupByUserId(userid);
      if (!groupInfo)
        return false;
      const poolInfo = await this.poolService.getPoolInfoByGroupId(groupInfo.group);
      if (!poolInfo)
        return false;
      current = {
        pool: poolInfo._id
      };
    }


    const balance = await this.poolService.getLastTurnOver(current.pool);

    if (!balance) return false;
    if (balance.remian < 20000) return false;
    if (balance.remain < amount) return false;
    const poolInfo = await this.poolService.getPoolInfo(current.pool);
    return poolInfo;
  }
}
