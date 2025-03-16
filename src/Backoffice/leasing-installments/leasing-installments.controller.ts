import { Controller, Get, Param, Req, Put, Body } from '@vision/common';
import { BackofficeLeasingInstallmentsService } from './leasing-installments.service';
import { GeneralService } from '../../Core/service/general.service';
import { Roles } from '../../Guard/roles.decorations';
import { Request } from 'express';
import { ChangeLeasingUserCreditStatusDto } from './dto/change-leasing-user-credit-status.dto';

@Controller('leasing-installments')
export class BackofficeLeasingInstallmentsController {
  constructor(
    private readonly leasingInstallmentsService: BackofficeLeasingInstallmentsService,
    private readonly generalService: GeneralService
  ) {}

  @Get('credits')
  // @Roles('admin')
  async getCredits(@Req() req: Request): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return await this.leasingInstallmentsService.getCredits(page);
  }

  @Get('credits/:id/installments')
  // @Roles('admin')
  async getCreditInstallments(@Req() req: Request, @Param('id') creditId: string): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return await this.leasingInstallmentsService.getCreditInstallments(creditId);
  }

  @Put('credits/:id/status')
  // @Roles('admin')
  async changeUserCreditStatus(
    @Req() req: Request,
    @Param('id') creditId: string,
    @Body() dto: ChangeLeasingUserCreditStatusDto
  ): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingInstallmentsService.changeUserCreditStatus(creditId, dto);
  }
}
