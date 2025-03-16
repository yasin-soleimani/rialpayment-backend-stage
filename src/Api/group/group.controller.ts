import { Controller, Post, Body, Req, Get, Put, Delete, Param } from '@vision/common';
import { GroupDto } from './dto/group.dto';
import { GroupService } from './group.service';
import { GeneralService } from '../../Core/service/general.service';
import { GroupChargeDto } from './dto/group-charge.dto';
import { Roles } from '../../Guard/roles.decorations';
import { OrganizationGroupStrategyDto } from './dto/group-organization.dto';
import { ExportJsService } from './services/export-js.service';
import { SendtoallDto } from './dto/sendtoall.dto';
import { GroupApiDechargeService } from './services/decharge.service';
import { GroupMakeQrService } from './qr/make-qr.servie';
import { GroupCardInfoApiService } from './services/card-info.service';
import { GroupCardReportApiService } from './services/charge-report.service';
import { GroupExcelChargeApiService } from './services/excel-charge.service';
import { timestamoToISO } from '@vision/common/utils/month-diff.util';

@Controller('group')
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly generalService: GeneralService,
    private readonly exportService: ExportJsService,
    private readonly makeQrPdfService: GroupMakeQrService,
    private readonly cardInfoService: GroupCardInfoApiService,
    private readonly reportService: GroupCardReportApiService,
    private readonly excelChargeService: GroupExcelChargeApiService
  ) {}

  @Post()
  @Roles('agent', 'customerclub')
  async newGroup(@Body() getInfo: GroupDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.groupService.newGroup(userid, getInfo);
  }

  @Get()
  @Roles('agent', 'customerclub')
  async getList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return this.groupService.getList(userid, page);
  }

  @Put()
  @Roles('agent', 'customerclub')
  async updateGroup(@Body() getInfo: GroupDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.groupService.updateGroup(userid, getInfo);
  }

  @Delete()
  @Roles('agent', 'customerclub')
  async deleteGroup(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const gid = await this.generalService.getGID(req);
    return this.groupService.deleteGroup(userid, gid);
  }

  @Get('all')
  @Roles('agent', 'customerclub')
  async getAll(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.groupService.getAllList(userid);
  }

  @Post('add')
  @Roles('agent', 'customerclub')
  async addtoGroup(@Body() getInfo: GroupDto, @Req() req): Promise<any> {
    const refid = await this.generalService.getUserid(req);
    return this.groupService.addUserToGroup(refid, getInfo.user, getInfo.gid);
  }

  @Get('users')
  @Roles('agent', 'customerclub')
  async getUsersList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const groupid = await this.generalService.getGID(req);
    const page = await this.generalService.getPage(req);
    return this.groupService.getUsersList(groupid, userid, page);
  }

  @Post('users/history')
  @Roles('agent', 'customerclub')
  async getUsersHistyryList(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return this.groupService.getHistory(getInfo, page, userid);
  }
  @Post('users/ticket/history')
  @Roles('agent', 'customerclub')
  async getUsersTicketHistoryList(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return this.groupService.getHistoryTicket(getInfo, page, userid);
  }
  @Post('users/history/all/excel')
  @Roles('agent', 'customerclub')
  async getUsersHistyryExcelList(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    if (getInfo.type == '100') {
      return this.groupService.getTicketsHistoryAllExcel(getInfo.gid, getInfo.type, getInfo.start, getInfo.end, userid);
    } else return this.reportService.getReport(getInfo.gid, getInfo.type, getInfo.start, getInfo.end, userid);
  }

  @Post('users/history/all')
  @Roles('agent', 'customerclub')
  async getUsersHistyryAllList(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    if (getInfo.type == '100')
      return this.groupService.getTicketsChargeHistoryAll(
        getInfo.gid,
        page,
        getInfo.type,
        getInfo.start,
        getInfo.end,
        userid
      );
    else
      return this.reportService.getReportPaginate(getInfo.gid, page, getInfo.type, getInfo.start, getInfo.end, userid);
  }

  @Get('users/toggle-card/:cardid')
  @Roles('agent', 'customerclub')
  async toggleCard(@Req() req, @Param('cardid') cardId: string): Promise<any> {
    await this.generalService.getUserid(req);
    return this.groupService.toggleCardStatus(cardId);
  }

  @Post('users')
  @Roles('agent', 'customerclub')
  async getUsersSearchList(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const groupid = await this.generalService.getGID(req);
    const page = await this.generalService.getPage(req);
    const type = await this.generalService.getType(req);
    return this.groupService.getUsersSearchList(getInfo.search, groupid, userid, page, type);
  }

  @Post('charge')
  // @Roles('agent', 'customerclub')
  async chargeGroupUsers(@Body() getInfo: GroupChargeDto, @Req() req): Promise<any> {
    console.log("get info:::", getInfo)
    const userid = await this.generalService.getUserid(req);
    return this.groupService.chargeGroupUsers(getInfo, getInfo.users, userid);
  }

  @Post('charge/paywallet')
  async chargePayWallet(@Body() getInfo: GroupChargeDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.groupService.chargePayWallet(getInfo, userid);
  }

  @Get('charge')
  @Roles('agent', 'customerclub')
  async chargeLists(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const gid = await this.generalService.getGID(req);
    return this.groupService.getChargedList(userid, gid);
  }

  @Post('charge/excel')
  @Roles('agent', 'customerclub')
  async chargeExcel(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.excelChargeService.action(req, getInfo, userid, getInfo.title);
  }

  @Post('organization/strategy')
  @Roles('agent', 'customerclub')
  async organizationCharge(@Body() getInfo: OrganizationGroupStrategyDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const role = await this.generalService.getRole(req);
  }

  @Get('organization/strategy')
  @Roles('agent', 'customerclub')
  async organizationList(): Promise<any> {}

  // @Get('updateterminal')
  // async updateTerminal(): Promise<any> {
  //   return this.groupService.getUpdateTerminals();
  // }

  // @Get('updatetest')
  // async updatetest(): Promise<any> {
  //   return this.groupService.updateTerminalBalance();
  // }

  @Get('export/excel/card')
  @Roles('agent', 'customerclub')
  async exportExcel(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const groupid = await this.generalService.getGID(req);
    return this.exportService.makeFile(userid, groupid);
  }

  @Get('users/all')
  @Roles('agent', 'customerclub')
  async getAllGroupUsers(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    console.log(userid, 'userid');
    const gid = await this.generalService.getGID(req);
    return this.groupService.getUsersGroup(gid, userid);
  }

  @Post('sendtoall')
  async sendtoAll(@Body() getInfo: SendtoallDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const role = await this.generalService.getRole(req);
    return this.groupService.sendToAll(getInfo, userid, role);
  }

  @Get('sendtoall/details')
  async getSendtoAllList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    const gid = await this.generalService.getGID(req);
    return this.groupService.getSendtoallList(userid, page, gid);
  }

  @Post('qr/single')
  async getCardQrSingle(@Body() getInfo, @Req() req): Promise<any> {
    return this.cardInfoService.makeQrDetails(getInfo.cardno);
  }

  @Get('qr/pdf')
  async exportPdf(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const groupid = await this.generalService.getGID(req);

    return this.makeQrPdfService.doIt(groupid, userid);
  }

  @Post('ticket')
  async tickets(@Body() getInfo, @Req() req) {
    const userid = await this.generalService.getUserid(req);
    return this.groupService.chargeGroupTickets(getInfo, getInfo.users, userid);
  }
  // @Post('addHistory')
  // async addHistory( @Body() getInfo, ): Promise<any> {
  //   return this.groupService.addCHargeHistoryGroupAll( getInfo )
  // }

  // @Post('decharge/wallet')
  // async dechargeWallet(@Body() getInfo, @Req() req): Promise<any> {
  //   const userid = await this.generalService.getUserid(req);
  //   return this.dechargeService.WalletDechargeGroup(userid, getInfo.gid, getInfo.amount);
  // }
}
