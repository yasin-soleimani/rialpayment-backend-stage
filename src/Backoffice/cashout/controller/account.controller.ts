import { Controller, Get, Req } from '@vision/common';
import { CashoutAccountBackofficeService } from '../services/accounts.service';
import { GeneralService } from '../../../Core/service/general.service';

@Controller('cashout/accounts')
export class CashoutAccountsBackofficeController {
  constructor(
    private readonly accountService: CashoutAccountBackofficeService,
    private readonly generalService: GeneralService
  ) {}

  @Get()
  async accountList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.accountService.getList();
  }
}
