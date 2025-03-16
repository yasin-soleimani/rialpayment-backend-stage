import { Controller, Post, Body, Req, Get } from '@vision/common';
import { CashoutAutomaticBackofficeService } from '../services/automatic.service';
import { CheckoutAutomaticCoreDto } from '../../../Core/checkout/automatic/dto/checkout-automatic.dto';
import { Request } from 'express';
import { GeneralService } from '../../../Core/service/general.service';

@Controller('cashout/automatic')
export class CashoutAutomaticBackofficeController {
  constructor(
    private readonly automaticCashoutService: CashoutAutomaticBackofficeService,
    private readonly generalService: GeneralService
  ) {}

  @Post('new')
  async addNew(@Body() getInfo: CheckoutAutomaticCoreDto, @Req() req: Request): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.automaticCashoutService.addNew(getInfo);
  }

  @Get()
  async getInfo(@Req() req: Request): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const user = await this.generalService.getID(req);
    return this.automaticCashoutService.getLast(user);
  }

  @Post('status')
  async changeStatus(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    console.log(getInfo, 'gg');
    return this.automaticCashoutService.changeStatus(getInfo.id, getInfo.status);
  }
}
