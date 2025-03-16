import { Body, Controller, Post, Req, Get } from '@vision/common';
import { GeneralService } from '../../../Core/service/general.service';
import { Roles } from '../../../Guard/roles.decorations';
import { BalanceTerminalApiService } from '../services/terminal-balance.service';

@Controller('balance/terminal')
export class BalanceTerminalController {
  constructor(
    private readonly generalService: GeneralService,
    private readonly terminalBalanceService: BalanceTerminalApiService
  ) {}

  @Post('details')
  @Roles('customerclub', 'agent')
  async getBalances(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);

    return this.terminalBalanceService.getBalances(userid, getInfo.user);
  }

  @Post('decharge')
  @Roles('customerclub', 'agent')
  async decharge(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);

    return this.terminalBalanceService.decharge(userid, getInfo.user, getInfo.terminal, Number(getInfo.amount));
  }

  @Get('club')
  async decharged(): Promise<any> {
    return this.terminalBalanceService.dechargeClub();
  }
}
