import { Body, Controller, Get, Param, Patch, Post, Put, Req } from '@vision/common';
import { Request } from 'express';
import { LeasingRef } from '../../Core/leasing-ref/interfaces/leasing-ref.interface';
import { GeneralService } from '../../Core/service/general.service';
import { Roles } from '../../Guard/roles.decorations';
import { AddNewLeasingRefDto } from './dto/add-new-leasing-ref.dto';
import { GetLeasingRefUserDataDto } from './dto/get-leasing-ref-user-data.dto';
import { LeasingRefReformDto } from './dto/leasing-ref-reform.dto';
import { LeasingRefService } from './leasing-ref.service';

@Controller('leasing-ref')
export class LeasingRefController {
  constructor(private readonly leasingRefService: LeasingRefService, private readonly generalService: GeneralService) {}

  @Get()
  @Roles('customerclub', 'agent')
  async getClubLeasingRefs(@Req() req: Request): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingRefService.getClubLeasingRefs(userId);
  }

  @Post()
  @Roles('customerclub', 'agent')
  async addNewLeasingRef(@Req() req: Request, @Body() dto: AddNewLeasingRefDto): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingRefService.addNewLeasingRef(userId, dto);
  }

  @Post('userinfo')
  @Roles('customerclub', 'agent')
  async getUserInfo(@Req() req: Request, @Body() dto: GetLeasingRefUserDataDto): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingRefService.getLeasingRefUserData(userId, dto);
  }

  @Get(':id')
  @Roles('customerclub', 'agent')
  async getById(@Req() req: Request, @Param('id') leasingRefId: string): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingRefService.getLeasingRefById(userId, leasingRefId);
  }

  @Patch(':id/reform')
  @Roles('customerclub', 'agent')
  async reform(@Req() req: Request, @Body() dto: LeasingRefReformDto, @Param('id') leasingRefId: string): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingRefService.reform(userId, leasingRefId, dto);
  }

  @Put(':id/updateshow')
  @Roles('customerclub', 'agent')
  async updateShow(
    @Req() req: Request,
    @Param('id') leasingRefId: string,
    @Body() dto: Pick<LeasingRef, 'show'>
  ): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingRefService.updateShow(userId, leasingRefId, dto);
  }
}
