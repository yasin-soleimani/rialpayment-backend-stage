import { Controller, Get, Res, Post, Body, Req } from '@vision/common';
import { AuthServiceDto } from './dto/authService.dto';
import { getUsernamPassword } from '@vision/common/utils/load-package.util';
import { AuthServiceService } from './authService.service';
import { AuthServiceChangePwDto } from './dto/authServiceChangePw.dto';
import { CardManagementApiDto } from './dto/cardManagement.dto';

@Controller('auth')
export class AuthServiceController {
  constructor(private readonly authService: AuthServiceService) {}

  @Post('newuser')
  async newuser(@Body() getInfo: AuthServiceDto, @Req() req): Promise<any> {
    const userpass = getUsernamPassword(req);
    return await this.authService.newuser(getInfo, userpass.username, userpass.password);
  }

  @Post('changepw')
  async changepw(@Body() getInfo: AuthServiceChangePwDto, @Req() req): Promise<any> {
    const userpass = getUsernamPassword(req);
    return await this.authService.changepw(getInfo, userpass.username, userpass.password);
  }

  @Post('login')
  async loginUser(@Body() getInfo: AuthServiceDto, @Req() req): Promise<any> {
    const userpass = getUsernamPassword(req);
    console.log(userpass);
    return await this.authService.login(getInfo, userpass.username, userpass.password);
  }

  @Post('getbalance')
  async getBalance(@Body() getInfo: AuthServiceDto, @Req() req): Promise<any> {
    const userpass = getUsernamPassword(req);
    return await this.authService.getBalance(getInfo, userpass.username, userpass.password);
  }

  @Post('transfer')
  async getDetail(@Body() getInfo: AuthServiceDto, @Req() req): Promise<any> {
    const userpass = getUsernamPassword(req);

    return await this.authService.transfer(getInfo, userpass.username, userpass.password);
  }

  @Post('transfer/confirm')
  async confitmTransfer(@Body() getInfo, @Req() req): Promise<any> {
    const userpass = getUsernamPassword(req);

    return await this.authService.confirmTansfer(
      getInfo.accountno,
      getInfo.amount,
      userpass.username,
      userpass.password
    );
  }

  @Post('card/submitnew')
  async submitShetabCard(@Body() getInfo: CardManagementApiDto, @Req() req): Promise<any> {
    const userpass = getUsernamPassword(req);

    return await this.authService.submitShetabCard(getInfo, userpass.username, userpass.username);
  }

  @Post('card/getlist')
  async showCardList(@Body() getInfo: CardManagementApiDto, @Req() req): Promise<any> {
    const userpass = getUsernamPassword(req);

    return await this.authService.getCardList(getInfo.mobile, userpass.username, userpass.password);
  }

  @Post('card/delete')
  async deleteCard(@Body() getInfo: CardManagementApiDto, @Req() req): Promise<any> {
    const userpass = getUsernamPassword(req);

    return await this.authService.deleteShetabCard(getInfo, userpass.username, userpass.password);
  }
}
