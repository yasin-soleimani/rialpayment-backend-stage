import { Controller, Get, Req, Put, Body, Param } from '@vision/common';
import { Request } from 'express';
import { GeneralService } from '../../Core/service/general.service';
import { BackofficeLeasingApplyService } from './leasing-apply.service';

@Controller('leasing-apply')
export class BackofficeLeasingApplyController {
  constructor(
    private readonly leasingApplyService: BackofficeLeasingApplyService,
    private readonly generalService: GeneralService
  ) {}

  @Get('')
  //   @Roles('admin')
  async getAll(@Req() req: Request): Promise<any> {
    await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return this.leasingApplyService.getAll(page);
  }
}
