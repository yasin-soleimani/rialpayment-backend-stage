import { Controller, Get, Post, Put, Req } from '@vision/common';
import { BackofficeUsersService } from './users.service';
import { Body } from '@vision/common/decorators/http/route-params.decorator';
import { BackofficeUsersFilterDto } from './dto/users-filter.dto';
import { GeneralService } from '../../Core/service/general.service';
import { Roles } from '../../Guard/roles.decorations';
import { BackofficeUsersLogDto } from './dto/users-log.dto';
import { BackofficeUsersCashoutDto } from './dto/users-cashout.dto';
import { BackofficeUsersChangeInformationDto } from './dto/users-changeInformation.dto';
import { BackofficeVoucherUserService } from './services/voucher.service';

@Controller('users')
export class BackofficeUsersController {
  constructor(
    private readonly userService: BackofficeUsersService,
    private readonly voucherService: BackofficeVoucherUserService,
    private readonly generalService: GeneralService
  ) {}

  @Post()
  @Roles('admin')
  async getUsers(@Body() getInfo: BackofficeUsersFilterDto, @Req() req): Promise<any> {
    const page = await this.generalService.getPage(req);
    return this.userService.getAll(getInfo, page);
  }

  @Get('user-club')
  async getUserClub(@Req() req) {
    const userId = await this.generalService.getNationalcode(req);
    return this.userService.findClubData(userId);
  }

  @Put('user-club')
  async setUserRef(@Body() body: { userId: string; refId: string }) {
    return this.userService.setUserRef(body.userId, body.refId);
  }

  @Post('information')
  @Roles('admin')
  async getUpdateUserInformation(@Body() getInfo: BackofficeUsersChangeInformationDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.userService.changeInformation(getInfo, userid);
  }

  @Post('status')
  @Roles('admin')
  async changeStus(@Body() getInfo, @Req() req): Promise<any> {
    return this.userService.changeStatus(getInfo.userid, getInfo.block, getInfo.cashout, getInfo.access);
  }

  @Post('cashout')
  @Roles('admin')
  async chanegCashout(@Body() getInfo, @Req() req): Promise<any> {
    return this.userService.changeMaxcashout(getInfo.user, getInfo.amount, getInfo.perday, getInfo.permin);
  }

  @Get()
  @Roles('admin')
  async getInfo(@Req() req): Promise<any> {
    const id = await this.generalService.getID(req);
    return this.userService.getUserInfo(id);
  }

  @Post('log')
  @Roles('admin')
  async getUserLogs(@Body() getInfo: BackofficeUsersLogDto, @Req() req): Promise<any> {
    const page = await this.generalService.getPage(req);
    return this.userService.getUserLog(getInfo, page);
  }

  @Post('log/tickets')
  @Roles('admin')
  async getUsersTicketLog(@Body() getInfo: BackofficeUsersLogDto, @Req() req): Promise<any> {
    const page = await this.generalService.getPage(req);
    return this.userService.getUsersTicketLog(getInfo, page);
  }

  @Post('report/cashout')
  @Roles('admin')
  async getCashoutHistory(@Body() getInfo: BackofficeUsersCashoutDto, @Req() req): Promise<any> {
    const page = await this.generalService.getPage(req);
    return this.userService.getCashoutHistory(getInfo, page);
  }

  @Post('voucher')
  @Roles('admin')
  async getVoucherList(@Body() getInfo, @Req() req): Promise<any> {
    const page = await this.generalService.getPage(req);
    return this.userService.getVouchers(getInfo.userid, page, Number(getInfo.type));
  }

  @Get('voucher/info')
  // @Roles('admin')
  async getVouchrInfo(@Req() req): Promise<any> {
    const id = await this.generalService.getID(req);
    return this.voucherService.getInfo(id);
  }

  @Post('voucher/status')
  @Roles('admin')
  async changeVoucherStatus(@Body() getInfo, @Req() req): Promise<any> {
    return this.userService.changeStus(getInfo.id, Number(getInfo.status));
  }

  @Get('identify/last')
  @Roles('admin')
  async getLastIdentifyUpload(@Req() req): Promise<any> {
    const userid = await this.generalService.getID(req);
    return this.userService.getLastIdentifyUploadData(userid);
  }

  @Post('identify/sitad')
  async getIdentifySitad(@Body() getInfo): Promise<any> {
    return this.userService.getIdentitySitad(getInfo.nin, getInfo.birthdate);
  }

  @Post('identify/card')
  async getIdentifyCard(@Body() getInfo): Promise<any> {
    return this.userService.getIdentifyWithCardNumber(getInfo.cardno, getInfo.nationalcode);
  }

  @Get('identify/list')
  @Roles('admin')
  async getIdentifyList(@Req() req): Promise<any> {
    const userid = await this.generalService.getID(req);
    const page = await this.generalService.getPage(req);
    return this.userService.getIdentifyList(userid, page);
  }
}
