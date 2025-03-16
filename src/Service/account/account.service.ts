import { Injectable } from '@vision/common';
import { AuthorizeAccountLoginDto } from './dto/account.dto';
import { Request, Response } from 'express';
import { AuthorizeAccountLoginService } from './services/account-login.service';
import { AuthorizeAccountGetTokenDto } from './dto/gettoken.dto';
import { AuthorizeAccountTokenService } from './services/account-get-token.service';
import { AuthorizeAccountWalletService } from './services/account-wallet.service';

@Injectable()
export class AuthorizeAccountService {
  constructor(
    private readonly loginService: AuthorizeAccountLoginService,
    private readonly getTokenService: AuthorizeAccountTokenService,
    private readonly walletService: AuthorizeAccountWalletService
  ) {}

  async getLogin(getInfo: AuthorizeAccountLoginDto, req: Request): Promise<any> {
    return this.loginService.getLogin(getInfo, req);
  }
  async setLoginPermission(getInfo, req): Promise<any> {
    return this.loginService.setPermissionApi(getInfo, req);
  }
  async redirect(reqid: string, res: Response): Promise<any> {
    return this.loginService.redirect(reqid, res);
  }
  async getToken(getInfo: AuthorizeAccountGetTokenDto, req: Request): Promise<any> {
    return this.getTokenService.play(getInfo, req);
  }
  // async login( getInfo: AuthorizeAccountLoginDto, res: Response, req: Request ): Promise<any> {
  //   return this.loginService.login( getInfo, res, req );
  // }
  async setPermission(getInfo, res, req): Promise<any> {
    return this.loginService.setPermission(getInfo, res, req);
  }

  async payment(getInfo, req): Promise<any> {
    return this.walletService.play(getInfo, req);
  }

  async actionPlay(getInfo, req, res): Promise<any> {
    return this.loginService.getActionPlay(getInfo.token, req, res);
  }
}
