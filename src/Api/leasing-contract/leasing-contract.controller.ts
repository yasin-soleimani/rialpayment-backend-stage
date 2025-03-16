import { Body, Controller, Get, Param, Post, Req } from '@vision/common';
import { Request } from 'express';
import { GeneralService } from '../../Core/service/general.service';
import { AddLeasingContractDto } from './dto/add-leasing-contract.dto';
import { GetLeasingContractQueryParams } from './dto/get-leasing-contract-query-params.dto';
import { LeasingContractService } from './leasing-contract.service';

@Controller('leasing-contract')
export class LeasingContractController {
  constructor(
    private readonly leasingContractService: LeasingContractService,
    private readonly generalService: GeneralService
  ) {}

  @Get('')
  async getContracts(@Req() req: Request, @Param() queryParams: GetLeasingContractQueryParams): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingContractService.getContracts(userId, queryParams);
  }

  @Post('')
  async addContract(@Req() req: Request, @Body() body: AddLeasingContractDto): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    console.log({leasingContractBody: body})
    return this.leasingContractService.addContract(userId, body);
  }

  @Get('refs')
  async getActiveLeasingRefs(@Req() req: Request): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.leasingContractService.getActiveLeasingRefs(userid);
  }

  @Get(':contractId')
  async getTheContract(@Req() req: Request, @Param('contractId') contractId: string): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingContractService.getTheContract(userId, contractId);
  }

  @Get(':contractId/extend')
  async extendContract(@Req() req: Request, @Param('contractId') contractId: string): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingContractService.extendContract(userId, contractId);
  }
}
