import { Controller, Get, Delete, Post, Put, Req, Body, successOpt, successOptWithData, Param } from '@vision/common';
import { PspCoreService } from '../../Core/psp/psp/pspCore.service';
import { UserMerchantDto } from './dto/merchant.dto';
import { MerchantcoreService } from '../../Core/merchant/merchantcore.service';
import { GeneralService } from '../../Core/service/general.service';
import { UserMerchantService } from './merchant.service';
import { FindByTerminalID } from './dto/findbyterminal.dto';
import { MerchantTerminalDto } from './dto/newterminal.dto';
import { getHeaderCategory } from '@vision/common/utils/validate-each.util';
import { MerchantCreditDto } from './dto/merchant-credit.dto';
import { MerchantCreditService } from './merchant-credit.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { GetIbanDto } from './dto/getIban.dto';
import { Roles } from '../../Guard/roles.decorations';
import { SetTerminalToClubDto } from './dto/set-terminal-to-club.dto';
import { UserMerchantTerminalService } from './services/terminal.service';
import { Request } from 'express';
import { AddPosDto } from '../../Backoffice/pos-management/dto/add-pos.dto';
import { UpdatePosDto } from '../../Backoffice/pos-management/dto/update-pos.dto';
import { MerchantShareApiService } from './services/merchant-share.service';

@Controller('usermerchant')
export class UserMerchantController {
  constructor(
    private readonly pspCoreService: PspCoreService,
    private readonly merchantCoreService: MerchantcoreService,
    private readonly generalService: GeneralService,
    private readonly uMerchantService: UserMerchantService,
    private readonly merchantCreditService: MerchantCreditService,
    private readonly terminalInfo: UserMerchantTerminalService,
    private readonly merchantShareService: MerchantShareApiService
  ) {}

  @Get('psp')
  async getPspList(): Promise<any> {
    return await this.pspCoreService.agentlist();
  }

  @Post()
  @Roles('agent', 'customerclub')
  async newMerchant(@Body() getInfo: UserMerchantDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    getInfo.ref = userid;
    return await this.uMerchantService.newMerchant(getInfo, req);
  }

  @Get('all')
  @Roles('agent', 'customerclub')
  async getAllMerchants(@Req() req: Request): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return await this.uMerchantService.getAllMerchantsByUserId(userid);
  }

  @Put()
  @Roles('agent', 'customerclub')
  async updateMerchant(@Body() getInfo: UserMerchantDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const merchantcode = await this.generalService.getMetchantCode(req);
    return await this.uMerchantService.updateMerchant(getInfo, merchantcode, userid, req);
  }

  @Post('merchant/status')
  @Roles('agent', 'customerclub')
  async changeMerchantStatus(@Body() getInfo: UserMerchantDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return await this.uMerchantService.changeMerchantStatus(getInfo, userid);
  }

  @Get('merchant/terminals/all')
  @Roles('agent', 'customerclub')
  async getAllTerminalsByUser(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.terminalInfo.getAllTerminalsByUserId(userid);
  }

  @Post('search')
  @Roles('agent', 'customerclub')
  async searchMerchant(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    const category = await getHeaderCategory(req);
    const search = req.body.search;
    return await this.uMerchantService.getSearchDataMerchant(userid, page, search, category);
  }

  @Get()
  @Roles('agent', 'customerclub')
  async getMerchantList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    const category = await getHeaderCategory(req);
    return await this.uMerchantService.getListMerchants(category, userid, page);
  }

  @Post('terminal')
  @Roles('agent', 'customerclub')
  async newTerminal(@Body() getInfo: MerchantTerminalDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return await this.uMerchantService.newTerminal(getInfo);
  }

  @Post('terminal/share')
  async terminalShare(@Body() getInfo): Promise<any> {
    this.uMerchantService.submitShare(JSON.parse(getInfo.data), getInfo.terminal);
    return successOpt();
  }

  @Get('terminal/share')
  async listTerminalShare(@Req() req): Promise<any> {
    const terminalid = await this.generalService.getTerminalid(req);
    return this.uMerchantService.getShare(terminalid);
  }

  @Delete('terminal/share')
  async deleteTerminalShare(@Req() req): Promise<any> {
    const id = await this.generalService.getID(req);
    return this.uMerchantService.removeShare(id);
  }

  @Put('terminal/share')
  async updateTerminalSheba(@Body() getInfo, @Req() req): Promise<any> {
    const id = await this.generalService.getID(req);
    return this.uMerchantService.updateShare(getInfo, id);
  }

  @Put('terminal')
  @Roles('agent', 'customerclub')
  async updateTerminal(@Body() getInfo: MerchantTerminalDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const terminalid = await this.generalService.getTerminalid(req);
    return await this.uMerchantService.editTerminal(userid, terminalid, getInfo);
  }

  @Post('terminal/status')
  @Roles('agent', 'customerclub')
  async changeTerminalStatus(@Body() getInfo: MerchantTerminalDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return await this.uMerchantService.changeTerminalStatus(getInfo, userid);
  }

  @Post('terminal/visible')
  @Roles('agent', 'customerclub')
  async showTerminal(@Req() req, @Body() getInfo): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const terminalid = await this.generalService.getTerminalid(req);
    if (isEmpty(getInfo.visible)) throw new FillFieldsException();
    return await this.uMerchantService.changeVisible(userid, terminalid, getInfo.visible);
  }

  @Post('terminal/search')
  @Roles('agent', 'customerclub')
  async searchTerminal(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    const search = req.body.search;
    const merchantid = await this.generalService.getMetchantCode(req);
    return await this.uMerchantService.getSearchTerminal(userid, page, search, merchantid);
  }

  @Get('terminal')
  @Roles('agent', 'customerclub')
  async getTerminalList(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const role = await this.generalService.getRole(req);
    const page = await this.generalService.getPage(req);
    const merchantid = await this.generalService.getMetchantCode(req);
    return await this.uMerchantService.getListTerminals(userid, page, merchantid, role);
  }

  @Post('findbyterminal')
  @Roles('agent', 'customerclub')
  async findById(@Body() getInfo: FindByTerminalID, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    // return await this.uMerchantService.findByTerminalID( getInfo.terminalid, userid );
  }

  @Get('getterminals')
  @Roles('agent', 'customerclub')
  async getListAllTerminals(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return this.uMerchantService.getAllTerminals(userid, page);
  }

  @Post('searchterminals')
  @Roles('agent', 'customerclub')
  async searchAllTerminals(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return this.uMerchantService.searchAllTerminal(getInfo.search, userid, page);
  }

  @Post('credit')
  @Roles('agent', 'customerclub')
  async addCreditTerminal(@Req() req, @Body() getInfo: MerchantCreditDto): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return await this.merchantCreditService.submitNew(getInfo);
  }

  @Post('getiban')
  @Roles('agent', 'customerclub')
  async getIban(@Body() getInfo: GetIbanDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const data = await this.uMerchantService.getIbanService(getInfo.merchantcode);
    return successOptWithData(data);
  }

  @Post('terminal/club')
  @Roles('agent')
  async setTerminaltoclub(@Body() getInfo: SetTerminalToClubDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.uMerchantService.setTerminalToClub(getInfo, userid);
  }

  @Delete('terminal/club')
  @Roles('agent')
  async removeTerminalClub(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const terminalid = await this.generalService.getTerminalId(req);
    const clubid = await this.generalService.getClubId(req);
    return this.uMerchantService.removeTerminalClub(terminalid, clubid, userid);
  }

  @Get('terminal/:terminalId/pos')
  @Roles('agent', 'customerclub')
  async getConnectedPos(@Req() req: Request, @Param('terminalId') terminalId: string): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.uMerchantService.getConnectedPosInfo(terminalId);
  }

  @Post('terminal/:terminalId/pos')
  @Roles('agent', 'customerclub')
  async connectPos(@Req() req: Request, @Param('terminalId') terminalId: string, @Body() dto: AddPosDto): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.uMerchantService.connectPos(userid, terminalId, dto);
  }

  @Delete('terminal/:terminalId/:posId')
  @Roles('agent', 'customerclub')
  async disconnectPost(@Req() req: Request, @Param('terminalId') terminalid: string, @Param('posId') posId: string) {
    const userid = await this.generalService.getUserid(req);
    return this.uMerchantService.disconnectPos(userid, terminalid, posId);
  }

  @Post('share')
  @Roles('agent', 'customerclub')
  async addNewShare(@Req() req: Request, @Body() dto: { user: string; merchants: string[] }): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.merchantShareService.createShare(userid, dto.user, dto.merchants);
  }

  @Get('share')
  @Roles('agent', 'customerclub')
  async getShares(@Req() req: Request): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    let type = await this.generalService.getType(req);
    type = isNaN(parseInt(type)) ? 1 : parseInt(type);
    return this.merchantShareService.listShares(type, userid);
  }

  @Get('club/shares')
  async getClubShares(@Req() req: Request): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    let type = await this.generalService.getType(req);
    type = isNaN(parseInt(type)) ? 0 : parseInt(type);
    return this.merchantShareService.listClubShares(type, userid);
  }

  @Delete('club/share')
  async acceptDeleteClubShare(@Req() req: Request): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    let id = await this.generalService.getID(req);
    return this.merchantShareService.acceptDelete(id, userid);
  }

  @Put('club/share')
  async acceptClubShareRequest(@Req() req: Request): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    let id = await this.generalService.getID(req);
    return this.merchantShareService.acceptShareRequest(id, userid);
  }

  @Delete('share')
  @Roles('agent', 'customerclub')
  async deleteShare(@Req() req: Request): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const id = await this.generalService.getID(req);
    return this.merchantShareService.deleteShare(id, userid);
  }
}
