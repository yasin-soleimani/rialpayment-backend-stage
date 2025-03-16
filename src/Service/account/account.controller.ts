import { Controller, Post, Body, Req, Res, Render, Get, Param } from '@vision/common';
import { AuthorizeAccountService } from './account.service';
import { AuthorizeAccountLoginDto } from './dto/account.dto';
import { Request, Response } from 'express';
import { getMerchantInfo } from 'src/WSDL/common/getMerchantInfo';

@Controller('account')
export class AuthorizeAccountServiceController {
  constructor(private readonly authService: AuthorizeAccountService) {}

  @Post('token')
  async getToken(@Body() getInfo, @Req() req: Request): Promise<any> {
    return this.authService.getToken(getInfo, req);
  }

  @Post()
  async actionPLay(@Body() getInfo, @Req() req: Request, @Res() res: Response): Promise<any> {
    return this.authService.actionPlay(getInfo, req, res);
  }

  @Post('login')
  async login(@Body() getInfo: AuthorizeAccountLoginDto, @Req() req: Request): Promise<any> {
    return this.authService.getLogin(getInfo, req);
  }

  @Post('login/permission')
  async setLoginPermission(@Body() getInfo, @Req() req: Request): Promise<any> {
    return this.authService.setLoginPermission(getInfo, req);
  }
  @Get('redirect/:reqid')
  async rediect(@Param('reqid') reqid, @Res() res: Response): Promise<any> {
    return this.authService.redirect(reqid, res);
  }

  @Post('pay')
  async payment(@Body() getInfo, @Req() req): Promise<any> {
    return this.authService.payment(getInfo, req);
  }

  @Get('invalid')
  @Render('authorize/invalid')
  async invalidRequest(): Promise<any> {}

  @Get()
  async getLogin(@Res() res: Response): Promise<any> {
    res.redirect(301, 'https://account.rialpayment.ir/auth/error');
  }
}
