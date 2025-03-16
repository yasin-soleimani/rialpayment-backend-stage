import { Controller, Post, Body, Get, Req, Put } from '@vision/common';
import { BackofficeAccountBlockFilterDto } from './dto/account-block-filter.dto';
import { GeneralService } from '../../Core/service/general.service';
import { Request, Response } from 'express';
import { BackofficeAccountBlockService } from './account-block.service';
import { BackofficeAccountBlockConfirmDto } from './dto/account-block-confirm.dto';
import { Roles } from '../../Guard/roles.decorations';

@Controller('account-block')
export class BackofficeAccountBlockController {
  constructor(
    private readonly generalService: GeneralService,
    private readonly accountBlockService: BackofficeAccountBlockService
  ) {}

  @Post('filter')
  @Roles('admin')
  async getList(@Body() getInfo: BackofficeAccountBlockFilterDto, @Req() req: Request): Promise<any> {
    const page = await this.generalService.getPage(req);
    return this.accountBlockService.getFilter(getInfo, page);
  }

  @Put('confirm')
  @Roles('admin')
  async getUserInfo(@Body() getInfo: BackofficeAccountBlockConfirmDto, @Req() req: Request): Promise<any> {
    return this.accountBlockService.confirm(getInfo.id);
  }
}
