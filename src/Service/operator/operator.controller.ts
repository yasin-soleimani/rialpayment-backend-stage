import { Controller, Post, Body, Req, Get } from '@vision/common';
import { OperatorService } from './operator.service';
import { GeneralService } from '../../Core/service/general.service';
import { dateRange, todayRange } from '@vision/common/utils/month-diff.util';

@Controller('operator')
export class OperatorController {
  constructor(private readonly operatorSerivice: OperatorService, private readonly generalService: GeneralService) {}

  @Post('login')
  async login(@Body() getInfo): Promise<any> {
    return this.operatorSerivice.login(getInfo);
  }

  @Post('voucher/new')
  async newVoucher(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.operatorSerivice.newVoucher(getInfo, userid);
  }

  @Post('tty')
  async tty(@Body() getinfo): Promise<any> {
    return dateRange(getinfo.date);
  }

  @Get('voucher/last')
  async lastVoucher(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.operatorSerivice.getLast(userid);
  }

  @Post('voucher/get')
  async getByRef(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.operatorSerivice.getByRef(userid, getInfo.serial);
  }

  @Post('report')
  async repot(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.operatorSerivice.report(userid, getInfo.date);
  }

  @Get('logout')
  async logout(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    console.log(userid);
    return this.operatorSerivice.logout(userid);
  }

  @Post('calc')
  async calc(@Body() getInfo): Promise<any> {
    return this.operatorSerivice.calc(getInfo.user);
  }
}
