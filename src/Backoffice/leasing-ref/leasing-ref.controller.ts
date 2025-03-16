import { Body, Controller, Get, Param, Post, Put, Req } from '@vision/common';
import { Request } from 'express';
import { GeneralService } from '../../Core/service/general.service';
import { Roles } from '../../Guard/roles.decorations';
import { GetAllLeasingRefsFilters } from './dto/leasing-ref-filters.dto';
import { UpdateLeasingRefStatusDto } from './dto/update-leasing-ref-status.dto';
import { BackofficeLeasingRefService } from './leasing-ref.service';
import { LeasingContractStatusEnum } from '../../Core/leasing-contract/enums/leasing-contract-status.enum';

@Controller('leasing-ref')
export class BackofficeLeasingRefController {
  constructor(
    private readonly backofficeLeasingRefService: BackofficeLeasingRefService,
    private readonly generalService: GeneralService
  ) {}

  @Post()
  // @Roles('admin')
  async getAllLeasingRefs(@Req() req: Request, @Body() body: GetAllLeasingRefsFilters): Promise<any> {
    await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return this.backofficeLeasingRefService.getAllLeasingRefs(page, body);
  }

  @Put('contracts/:contractId')
  // @Roles('admin')
  async updateTheContract(
    @Req() req: Request,
    @Param('contractId') contractId: string,
    @Body() body: { status: LeasingContractStatusEnum }
  ): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.backofficeLeasingRefService.updateTheContract(contractId, body);
  }

  @Put(':id')
  // @Roles('admin')
  async updateStatus(
    @Req() req: Request,
    @Param('id') leasingRefId: string,
    @Body() body: UpdateLeasingRefStatusDto
  ): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.backofficeLeasingRefService.updateLeasingRefStatus(leasingRefId, userid, body);
  }

  @Get(':id/contracts')
  // @Roles('admin')
  async getLeasingContracts(@Req() req: Request, @Param('id') leasingRefId: string): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.backofficeLeasingRefService.getLeasingContracts(leasingRefId);
  }

}
