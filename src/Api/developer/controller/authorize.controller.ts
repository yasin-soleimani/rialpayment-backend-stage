import { Controller, Post, Get, Put, Body, Req } from '@vision/common';
import { Request, Response } from 'express';
import { GeneralService } from '../../../Core/service/general.service';
import { DeveloperAuthorizeApiDto } from '../dto/authorize.dto';
import { DeveloperAuthorizeApiService } from '../services/authorize.service';

@Controller('developer/authorize')
export class DeveloperAuthorizeApiController {
  constructor(
    private readonly generalService: GeneralService,
    private readonly authService: DeveloperAuthorizeApiService
  ) {}

  @Post()
  async submit(@Body() getInfo: DeveloperAuthorizeApiDto, @Req() req: Request): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    getInfo.user = userid;
    return this.authService.submit(getInfo, req);
  }

  @Post('status')
  async changeStatus(@Body() getInfo, @Req() req: Request): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.authService.changeStatus(getInfo.id, getInfo.status);
  }

  @Get()
  async getList(): Promise<any> {}

  @Put()
  async update(@Body() getInfo: DeveloperAuthorizeApiDto, @Req() req: Request): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    getInfo.user = userid;
    return this.authService.update(getInfo, req);
  }
}
