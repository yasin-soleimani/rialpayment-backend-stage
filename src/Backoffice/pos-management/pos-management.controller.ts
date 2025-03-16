import { Request } from 'express';
import { Controller, Get, Query, Req, Post, Body, Param, Put } from '@vision/common';
import { Roles } from '../../Guard/roles.decorations';
import { PosGetAllQueryDto } from './dto/post-get-all-query.dto';
import { BackofficePosManagementService } from './pos-management.service';
import { GeneralService } from '../../Core/service/general.service';
import { AddPosDto } from './dto/add-pos.dto';
import { ConnectPosToTerminalDto } from './dto/connect-pos-to-terminal.dto';
import { UpdatePosDto } from './dto/update-pos.dto';

@Controller('posmanagement')
export class BackofficePosManagementController {
  constructor(
    private readonly posManagementService: BackofficePosManagementService,
    private readonly generalService: GeneralService
  ) {}

  @Get('')
  @Roles('admin')
  async getAll(@Query() queryParams: PosGetAllQueryDto, @Req() req: Request): Promise<any> {
    const page = await this.generalService.getPage(req);
    return this.posManagementService.getAll(page, queryParams);
  }

  @Post('')
  @Roles('admin')
  async addNewPos(@Body() body: AddPosDto): Promise<any> {
    return this.posManagementService.addNewPos(body);
  }

  @Get('history')
  @Roles('admin')
  async getAllHistories(@Query() queryParams: PosGetAllQueryDto, @Req() req: Request): Promise<any> {
    const page = await this.generalService.getPage(req);
    return this.posManagementService.getAllHistories(page, queryParams);
  }

  @Get(':posId')
  @Roles('admin')
  async getById(@Param('posId') posId: string): Promise<any> {
    return this.posManagementService.getById(posId);
  }

  @Put(':posId')
  @Roles('admin')
  async updatePos(@Param('posId') posId: string, @Body() body: UpdatePosDto): Promise<any> {
    return this.posManagementService.updatePos(posId, body);
  }

  @Post(':posId/connect')
  @Roles('admin')
  async connectToTerminal(
    @Req() req: Request,
    @Body() body: ConnectPosToTerminalDto,
    @Param('posId') posId: string
  ): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.posManagementService.connectToTerminal(posId, body, userid);
  }

  @Post(':posId/disconnect')
  @Roles('admin')
  async disconnectFromTerminal(
    @Req() req: Request,
    @Param('posId') posId: string,
    @Body() body: { terminal: string }
  ): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.posManagementService.disconnectFromTerminal(posId, userid, body);
  }

  @Get(':posId/history')
  @Roles('admin')
  async getPosHistory(@Param('posId') posId: string): Promise<any> {
    return this.posManagementService.getPosHistory(posId);
  }
}
