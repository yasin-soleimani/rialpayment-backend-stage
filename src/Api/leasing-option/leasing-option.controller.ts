import { Body, Controller, Get, Param, Post, Put, Req, Patch } from '@vision/common';
import { Request } from 'express';
import { CreateLeasingOptionDto } from '../../Core/leasing-option/dto/create-leasing-option.dto';
import { GeneralService } from '../../Core/service/general.service';
import { LeasingOptionPatchAllowedTerminalsDto } from '../../Core/leasing-option/dto/patch-allowed-terminals.dto';
import { UpdateLeasingOptionDto } from '../../Core/leasing-option/dto/update-leasing-option.dto';
import { LeasingOptionService } from './leasing-option.service';

@Controller('leasing-option')
export class LeasingOptionController {
  constructor(
    private readonly generalService: GeneralService,
    private readonly leasingOptionService: LeasingOptionService
  ) {}

  @Get('')
  async getOptionsListByLeasingUser(@Req() req: Request): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return this.leasingOptionService.getOptionsListByLeasingUser(userId, page);
  }

  @Post('')
  async addOption(@Req() req: Request, @Body() body: CreateLeasingOptionDto): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingOptionService.createOptionByLeasingUser(userId, body);
  }

  @Get('terminals')
  async getAccessibleTerminals(@Req() req: Request): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingOptionService.getAccessibleTerminals(userId);
  }

  @Get(':id')
  async getTheOption(@Req() req: Request, @Param('id') id: string): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingOptionService.getTheOption(userId, id);
  }

  @Put(':id')
  async updateLeasingOption(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: UpdateLeasingOptionDto
  ): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingOptionService.updateLeasingOption(userId, id, body);
  }

  @Patch(':id/terminals')
  async patchAllowedTerminals(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: LeasingOptionPatchAllowedTerminalsDto
  ): Promise<any> {
    const userId = await this.generalService.getUserid(req);
    return this.leasingOptionService.patchAllowedTerminals(userId, id, body);
  }
}
