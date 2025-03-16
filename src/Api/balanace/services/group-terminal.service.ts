import { Injectable } from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { CoreGroupTerminalBalanceService } from '../../../Core/group-terminal-balance/group-tb.service';
import { GroupCoreService } from '../../../Core/group/group.service';
import { MerchantCoreTerminalBalanceService } from '../../../Core/merchant/services/merchant-terminal-balance.service';

@Injectable()
export class BalanceGroupTerminalApiService {
  constructor(
    private readonly groupService: GroupCoreService,
    private readonly groupTBService: CoreGroupTerminalBalanceService,
    private readonly balanceService: MerchantCoreTerminalBalanceService
  ) {}

  async action(group: string, terminals: [], terminalsFrom: [], userId: string): Promise<any> {
    const users = await this.groupService.getUsers(group);
    // const myTerminals = await this.groupTBService.getMerchantsByUserIdAll(userId);
    if (!terminals || terminals.length < 1) throw new UserCustomException('ترمینال یافت نشد');
    if (!terminalsFrom || terminalsFrom.length < 1) throw new UserCustomException('ترمینال یافت نشد');
    this.loop(users, terminals, terminalsFrom); //myTerminals);
    return this.success();
  }

  private async loop(users, terminals, myTerminals): Promise<any> {
    for (const item of users) {
      if (item.user) {
        this.user(item, terminals, myTerminals);
      } else if (item.card) {
        this.card(item, terminals, myTerminals);
      }
    }
  }

  private async card(info, terminals, myTerminals): Promise<any> {
    const list = await this.getBalanceTermnials(info.card, myTerminals);
    for (const item of list) {
      this.balanceService.updateTerminalByIdPush(item._id, terminals);
    }
  }

  private async user(info, terminals, myTerminals): Promise<any> {
    const list = await this.getBalanceTermnials(info.user, myTerminals);
    for (const item of list) {
      this.balanceService.updateTerminalByIdPush(item._id, terminals);
    }
  }

  private async getBalanceTermnials(id: string, terminals): Promise<any> {
    return this.balanceService.getAllListByTerminals(id, terminals);
  }

  private success() {
    return {
      status: 200,
      message: 'درخواست با موفقیت ثبت شد',
      success: true,
    };
  }
}
