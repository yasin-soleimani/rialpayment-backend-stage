import {
  faildOpt,
  Injectable,
  successOpt,
  successOptWithPagination,
  successOptWithDataNoValidation,
  InternalServerErrorException,
} from '@vision/common';
import { GroupTBTerminalResult } from '../../../Core/group-terminal-balance/function/terminal.func';
import { CoreGroupTerminalBalanceService } from '../../../Core/group-terminal-balance/group-tb.service';
import { CoreGroupTerminalService } from '../../../Core/group-terminal-balance/group-terminal.service';

@Injectable()
export class BalanceTerminalApiService {
  constructor(
    private readonly terminalBalanceService: CoreGroupTerminalBalanceService,
    private readonly GroupTbService: CoreGroupTerminalService
  ) {}

  async getBalances(ref: string, userId: string): Promise<any> {
    const data = await this.terminalBalanceService.getBalanceInTerminals(ref, userId);

    return successOptWithDataNoValidation(data);
  }

  async decharge(ref: string, userId: string, terminalId: string, amount: number): Promise<any> {
    const data = await this.terminalBalanceService.deChargeBalance(ref, userId, terminalId, amount);
    if (!data) return faildOpt();

    return successOpt();
  }

  async dechargeClub(): Promise<any> {
    this.terminalBalanceService.dechargeClub();
    return successOpt();
  }

  async getList(id: string, userId: string, page: number): Promise<any> {
    const data = await this.GroupTbService.getList(id, userId, page);
    data.docs = GroupTBTerminalResult(data.docs);
    return successOptWithPagination(data);
  }

  async updateTerminal(id, terminals): Promise<any> {
    const data = await this.GroupTbService.updateTerminal(id, terminals);
    if (!data) throw new InternalServerErrorException();

    return successOpt();
  }
}
