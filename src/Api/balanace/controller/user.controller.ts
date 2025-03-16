import { Controller, Get, Req, Post, Body } from '@vision/common';
import { GeneralService } from '../../../Core/service/general.service';
import { Roles } from '../../../Guard/roles.decorations';
import { BalanceGroupTerminalApiService } from '../services/group-terminal.service';
import { BalanceTerminalApiService } from '../services/terminal-balance.service';

@Controller('balance/user')
export class BalanceUserController {
  constructor(
    private readonly generalService: GeneralService,
    private readonly terminalBalanceService: BalanceTerminalApiService,
    private readonly groupBalanceService: BalanceGroupTerminalApiService
  ) {}

  @Get('list')
  // @Roles('customerclub', 'agent')
  async getLIst(@Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    const id = await this.generalService.getID(req);

    return this.terminalBalanceService.getList(id, userId, page);
  }

  @Post('terminal')
  // @Roles('customerclub', 'agent')
  async updateTerminal(@Body() getInfo, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.terminalBalanceService.updateTerminal(getInfo.id, getInfo.terminals);
  }

  @Post('group')
  // @Roles('customerclub', 'agent')
  async groupUpdate(@Body() getInfo, @Req() req): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.groupBalanceService.action(getInfo.group, getInfo.terminals, getInfo.terminalsFrom, userId);
  }
}
