import { Injectable, successOpt, successOptWithPagination } from '@vision/common';
import { TicketsCoreService } from '../../Core/tickets/tickets.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { GroupCoreService } from '../../Core/group/group.service';

@Injectable()
export class TicketApiService {
  constructor(
    private readonly ticketsCoreService: TicketsCoreService,
    private readonly groupService: GroupCoreService
  ) {}

  async getLastTransactions(user: string, page: number): Promise<any> {
    const tickets = await this.ticketsCoreService.getLastTicketsHistoryByUser(user, page);
    return successOptWithPagination(tickets);
  }

  async getLastChargesByUser(user: string, page: number) {
    const ticketsCharges = await this.ticketsCoreService.getLastTicketsByUser(user, page);
    return successOptWithPagination(ticketsCharges);
  }

  async deCharge(data, user: string) {
    const { id, count } = data;
    await this.ticketsCoreService.deChargeTicketCount(id, count);
    return successOpt();
  }

  async shareTerminals(data, user: string) {
    const { terminalsFrom, terminals, group } = data;
    const users = await this.groupService.getUsers(group);
    console.log('users::::::: ', users);
    // const myTerminals = await this.groupTBService.getMerchantsByUserIdAll(userId);
    if (!terminals || terminals.length < 1) throw new UserCustomException('ترمینال یافت نشد');
    if (!terminalsFrom || terminalsFrom.length < 1) throw new UserCustomException('ترمینال یافت نشد');
    this.loop(users, terminals, terminalsFrom);
    return successOpt();
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
    const list = await this.ticketsCoreService.getTicketChargesByRefIdAndTerminals(info.card, myTerminals);
    for (const item of list) {
      this.ticketsCoreService.updateTerminalByIdPush(item._id, terminals);
    }
  }

  private async user(info, terminals, myTerminals): Promise<any> {
    console.log('in user :::::::', info);
    const list = await this.ticketsCoreService.getTicketChargesByRefIdAndTerminals(info.user, myTerminals);
    console.log('list::::::::', list);
    for (const item of list) {
      await this.ticketsCoreService.updateTerminalByIdPush(item._id, terminals);
    }
  }
}
