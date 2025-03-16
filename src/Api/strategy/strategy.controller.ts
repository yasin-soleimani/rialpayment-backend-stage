import { Controller, Delete, Get, Post, Req } from '@vision/common';
import { GeneralService } from '../../Core/service/general.service';
import { StrategyApiService } from './strategy.service';
import { Body } from '@vision/common/decorators/http/route-params.decorator';
import { StrategyApiDto } from './dto/strategy-api.dto';
import { Roles } from '../../Guard/roles.decorations';
import { OrganizationStrategyDto } from './dto/strategy-organization.dto';

@Controller('strategy')
export class StrategyApiController {
  constructor(private readonly generalService: GeneralService, private readonly strategyService: StrategyApiService) {}

  @Post()
  @Roles('agent', 'customerclub')
  async newStrategy(@Body() getInfo: StrategyApiDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    getInfo.user = userid;
    return this.strategyService.new(getInfo);
  }

  @Get()
  @Roles('agent', 'customerclub')
  async getList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const terminalid = await this.generalService.getTerminalid(req);
    return this.strategyService.getList(terminalid, userid);
  }

  @Get('details')
  @Roles('agent', 'customerclub')
  async getDetails(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const gid = await this.generalService.getPID(req);
    console.log(gid, 'pid');
    return this.strategyService.getGroupDetails(userid, gid);
  }

  @Get('group')
  @Roles('agent', 'customerclub')
  async getGroupList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const gid = await this.generalService.getGID(req);
    return this.strategyService.getGroupList(gid, userid);
  }

  @Get('credit')
  @Roles('agent', 'customerclub')
  async creditGetList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const terminalid = await this.generalService.getTerminalid(req);
    return this.strategyService.creditGetList(terminalid, userid);
  }

  @Delete()
  @Roles('agent', 'customerclub')
  async deleteStrategy(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const id = await this.generalService.getID(req);
    return this.strategyService.remove(id, userid);
  }

  @Get('settings')
  @Roles('agent', 'customerclub')
  async getSettingsList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const terminalid = await this.generalService.getTerminalid(req);
    return this.strategyService.getSettingsList(terminalid, userid);
  }

  @Post('organization')
  @Roles('agent', 'customerclub')
  async organizationCharge(@Body() getInfo: OrganizationStrategyDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const role = await this.generalService.getRole(req);
    return this.strategyService.orgNewStrategy(getInfo, userid, role);
  }

  @Get('organization')
  @Roles('agent', 'customerclub')
  async organizationList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const groupid = await this.generalService.getGID(req);
    return this.strategyService.getOrgList(userid, groupid);
  }

  @Get('test')
  async getTest(): Promise<any> {
    return this.strategyService.getOrgan();
  }
}
