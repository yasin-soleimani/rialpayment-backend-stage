import { Controller, Get, Post, Body } from '@vision/common';
import { BackofficeCheckoutBanksService } from '../services/bank.service';

@Controller('checkoutsettings/banks')
export class BackofficeCheckoutBanksController {
  constructor(private readonly banksService: BackofficeCheckoutBanksService) {}

  @Get()
  async getList(): Promise<any> {
    return this.banksService.getBanksList();
  }

  @Post()
  async addNew(@Body() getInfo): Promise<any> {
    return this.banksService.addNew(getInfo.name);
  }
}
