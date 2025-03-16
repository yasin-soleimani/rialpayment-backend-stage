import { Controller, Post, Body, Req, Get } from '@vision/common';
import { Request, Response } from 'express';
import { GeneralService } from '../../Core/service/general.service';
import { BackofficeAuthorizeService } from './authorize.service';
import { Roles } from '../../Guard/roles.decorations';
import { AuthorizeUserWageDto } from './dto/authorize-wage.dto';
import { BackofficeAuthorizeUserWageService } from './services/authorize-wage.service';

@Controller('authorize')
export class BackofficeAuthorizeController {
  constructor(
    private readonly generalService: GeneralService,
    private readonly authService: BackofficeAuthorizeService,
    private readonly wageService: BackofficeAuthorizeUserWageService
  ) {}

  @Post('list')
  @Roles('admin')
  async getList(@Body() getInfo, @Req() req: Request): Promise<any> {
    const page = await this.generalService.getPage(req);
    return this.authService.getList(getInfo, page);
  }

  @Post('status')
  @Roles('admin')
  async changeStatusType(@Body() getInfo, @Req() req: Request): Promise<any> {
    return this.authService.StatusChange(getInfo.id, getInfo.status, getInfo.type);
  }

  @Post('wage')
  @Roles('admin')
  async setStatus(@Body() getInfo: AuthorizeUserWageDto, @Req() req: Request): Promise<any> {
    return this.wageService.addNew(getInfo);
  }

  @Get('wage')
  @Roles('admin')
  async getWageInfo(@Req() req: Request): Promise<any> {
    const id = await this.generalService.getID(req);
    return this.wageService.getWageInfo(id);
  }
}
