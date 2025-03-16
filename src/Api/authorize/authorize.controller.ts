import { Controller, Get, Req, Body, Put, Post } from '@vision/common';
import { Request, Response } from 'express';
import { GeneralService } from '../../Core/service/general.service';
import { getMerchantInfo } from 'src/WSDL/common/getMerchantInfo';
import { AuthorizeApiService } from './authorize.service';

@Controller('authorize')
export class AuthorizeApiController {
  constructor(private readonly generalService: GeneralService, private readonly authService: AuthorizeApiService) {}

  @Get()
  async getList(@Req() req: Request): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.authService.getList(userid);
  }

  @Put()
  async update(@Body() getInfo, @Req() req: Request): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.authService.udpate(getInfo, userid);
  }

  @Post('status')
  async changeStatus(@Body() getInfo, @Req() req: Request): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.authService.changeStatus(userid, getInfo.id);
  }
}
