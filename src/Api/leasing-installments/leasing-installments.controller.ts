import { Body, Controller, Get, Param, Post, Req, Res } from '@vision/common';
import { GeneralService } from '../../Core/service/general.service';
import { LeasingInstallmentsService } from './leasing-installments.service';
import { Request } from 'express';
import { PayInstallmentsDto } from './dto/pay-installments.dto';
import { LeasingInstallmentsCallbackService } from './services/leasing-installments-callback.service';

@Controller('leasing-installments')
export class LeasingInstallmentsController {
  constructor(
    private readonly generalService: GeneralService,
    private readonly leasingInstallmentsService: LeasingInstallmentsService,
    private readonly callbackService: LeasingInstallmentsCallbackService
  ) {}

  @Get('usercredits')
  async getUserCredits(@Req() req: Request) {
    const userId = await this.generalService.getUserid(req);
    return await this.leasingInstallmentsService.getUserCredits(userId);
  }

  @Get('usercredits/:leasingUserCreditId')
  async getLeasingInstallments(@Req() req: Request, @Param('leasingUserCreditId') leasingUserCreditId: string) {
    const userId = await this.generalService.getUserid(req);
    return await this.leasingInstallmentsService.getLeasingInstallments(leasingUserCreditId);
  }

  @Post('pay')
  async payInstallments(@Req() req: Request, @Body() dto: PayInstallmentsDto) {
    const userId = await this.generalService.getUserid(req);
    const referer = req.headers.referer;
    return await this.leasingInstallmentsService.payInstallments(userId, dto, referer);
  }

  @Post('pay/callback')
  async payInstallmentsCallback(@Req() req: Request, @Body() getInfo: any, @Res() res: any): Promise<any> {
    console.log('leasing-installments/pay/callback:::: ', getInfo);
    return this.callbackService.paymentCallback(getInfo, req, res);
  }
}
