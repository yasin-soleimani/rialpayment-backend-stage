import { Injectable, successOptWithPagination } from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { GroupCoreService } from '../group/group.service';
import { MerchantCoreTerminalBalanceService } from '../merchant/services/merchant-terminal-balance.service';
import { CardService } from '../useraccount/card/card.service';
import { GroupTBTerminalResult } from './function/terminal.func';
import { CoreGroupTerminalBalanceService } from './group-tb.service';

@Injectable()
export class CoreGroupTerminalService {
  constructor(
    private readonly balanceService: MerchantCoreTerminalBalanceService,
    private readonly groupTBService: CoreGroupTerminalBalanceService,
    private readonly cardService: CardService,
    private readonly groupUserService: GroupCoreService
  ) {}

  async getList(id: string, userId: string, page: number): Promise<any> {
    const terminals = await this.groupTBService.getTerminalByUserId(userId);
    if (!terminals || terminals.length < 1) throw new UserCustomException('ترمینال یافت نشد');

    const myId = await this.getId(id);
    const list = await this.balanceService.getListByTerminals(myId, terminals, page);

    return list;
  }

  async updateTerminal(id: [], terminals: []): Promise<any> {
    let counter = 0;

    for (const item of id) {
      const result = await this.balanceService.updateTerminalById(item, terminals);
      if (result) counter++;
    }
    if (counter < 1) throw new UserCustomException('عملیات با خطا مواجه شده است');

    return true;
  }

  private async getId(id: string): Promise<any> {
    let myId = id;
    const cardInfo = await this.cardService.getCardInfoById(id);
    if (cardInfo) {
      if (cardInfo.user) myId = cardInfo.user;
    }
    return myId;
  }
}
