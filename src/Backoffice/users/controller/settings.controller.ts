import { Controller, Get, Req, Body, Post } from '@vision/common';
import { GeneralService } from '../../../Core/service/general.service';
import { BackofficeUsersSettingsService } from '../services/settings.service';
import { BackofficeUsersSettingsCashout } from '../dto/users-settings-cashout.dto';
import { Roles } from '../../../Guard/roles.decorations';

@Controller('users/settings')
export class BackofficeUsersSettingsController {
  constructor(
    private readonly generalService: GeneralService,
    private readonly settingsService: BackofficeUsersSettingsService
  ) {}

  @Get('cashout')
  @Roles('admin')
  async getCashoutDetails(@Req() req): Promise<any> {
    const userid = await this.generalService.getID(req);
    return this.settingsService.getUserCashoutDetails(userid);
  }

  @Post('cashout')
  @Roles('admin')
  async updateUsersCashoutDetails(@Body() getInfo: BackofficeUsersSettingsCashout, @Req() req): Promise<any> {
    const userid = await this.generalService.getID(req);
    return this.settingsService.submitUserCashoutDetails(getInfo, userid);
  }

  @Post('cashout/status')
  @Roles('admin')
  async changeStatus(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getID(req);
    return this.settingsService.changeStatus(userid, getInfo.status);
  }
}
