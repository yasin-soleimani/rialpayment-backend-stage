import { Controller, Post, Get, Body } from '@vision/common';
import { BackofficeCheckoutAccountService } from '../services/account.service';
import { BackofficeCheckoutBankAccountDto } from '../dto/account.dto';
import { dateWithTz } from '@vision/common/utils/month-diff.util';

@Controller('checkoutsettings/account')
export class BackofficeCheckoutAccountController {
  constructor(private readonly accountService: BackofficeCheckoutAccountService) {}

  @Post()
  async addNew(@Body() getInfo: BackofficeCheckoutBankAccountDto): Promise<any> {
    // return dateWithTz();
    return this.accountService.addNew(getInfo);
  }
}
