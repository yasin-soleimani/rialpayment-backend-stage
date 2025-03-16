import { Injectable } from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { GroupCoreUsersCardsService } from '../../group/services/group-users-card.service';
import { MerchantcoreService } from '../../merchant/merchantcore.service';
import { MerchantCoreTerminalService } from '../../merchant/services/merchant-terminal.service';
import * as mongoose from 'mongoose';

@Injectable()
export class GroupReportCommonCoreService {
  constructor(
    private readonly terminalService: MerchantCoreTerminalService,
    private readonly userReportService: GroupCoreUsersCardsService
  ) {}

  async terminalIds(merchantId: string, userId: string): Promise<any> {
    const terminals = await this.terminalService.getTerminalsByMerchantId(merchantId);
    if (terminals.length < 1) return false;

    const tmp = Array();

    for (const item of terminals) {
      tmp.push(mongoose.Types.ObjectId(item._id));
    }

    return tmp;
  }
  async terminals(merchantId: string, userId: string): Promise<any> {
    const terminals = await this.terminalService.getTerminalsByMerchantId(merchantId);
    if (terminals.length < 1) return false;

    const tmp = Array();

    for (const item of terminals) {
      tmp.push(item.terminalid);
    }

    return tmp;
  }

  async getGroupUsers(groupId: string): Promise<any> {
    const users = await this.userReportService.getCalc(groupId);
    if (users.length < 1) return false;
    return users;
  }

  async getGroupsUsers(
    groupIds: string[]
  ): Promise<{
    users: string[];
    cardsNo: number[];
    cardId: string[];
  }> {
    const users = await this.userReportService.getCalcAll(groupIds);
    if (users.length < 1) return null;
    return users;
  }
}
