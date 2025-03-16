import { Injectable, InternalServerErrorException } from '@vision/common';
import { AuthorizeUserzCoreService } from '../../../Core/authorize/user/user.service';
import { AuthorizeClientCoreService } from '../../../Core/authorize/client/client.service';
import { AuthorizeRequestCoreService } from '../../../Core/authorize/request/request.service';
import { Request, Response } from 'express';
import { AuthorizeAccountGetTokenDto } from '../dto/gettoken.dto';
import { AuthorizeAccountTokenConst } from '../const/token-type.const';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { AuthorizeAccountCheckIp } from '../functions/check-ip.function';
import { AuthorizeAccountWarningTypes } from '../const/warning-types.const';

@Injectable()
export class AuthorizeAccountTokenService {
  constructor(
    private readonly authUserService: AuthorizeUserzCoreService,
    private readonly authClientService: AuthorizeClientCoreService,
    private readonly authRequestService: AuthorizeRequestCoreService
  ) {}

  async play(getInfo: AuthorizeAccountGetTokenDto, req: Request): Promise<any> {
    const userInfo = await this.authUserService.getInfoByApiKey(getInfo.apikey);
    if (!userInfo)
      throw new UserCustomException(
        'دسترسی برای شما امکان پذیر نمی باشد',
        false,
        AuthorizeAccountWarningTypes.Access_Denied
      );

    const ipvalid = AuthorizeAccountCheckIp(userInfo.ip, req.ip);
    if (ipvalid === false)
      throw new UserCustomException(
        'دسترسی برای شما امکان پذیر نمی باشد',
        false,
        AuthorizeAccountWarningTypes.Access_Denied
      );

    if (userInfo.status == false)
      throw new UserCustomException('غیر فعال می باشد', false, AuthorizeAccountWarningTypes.Disabled);

    if (userInfo.type != 0) throw new UserCustomException('تایید نشده', false, AuthorizeAccountWarningTypes.Rejected);
    switch (Number(getInfo.type)) {
      case AuthorizeAccountTokenConst.login: {
        return this.getToken(getInfo, userInfo, req.ip);
      }

      case AuthorizeAccountTokenConst.payment: {
        return this.getToken(getInfo, userInfo, req.ip);
      }

      default: {
        throw new UserCustomException('درخواست نامعتبر', false, 400);
      }
    }
  }

  private async getToken(getInfo: AuthorizeAccountGetTokenDto, userInfo: any, ip: string): Promise<any> {
    return this.authRequestService
      .submit(
        getInfo.apikey,
        null,
        userInfo._id,
        userInfo.ip[0],
        null,
        ip,
        Number(getInfo.type),
        getInfo.trackingnumber
      )
      .then(async (res) => {
        if (!res) throw new InternalServerErrorException();
        const token = await this.authRequestService.setToken(res._id);
        return {
          status: 200,
          success: true,
          message: 'عملیات با موفقیت انجام شد',
          token: token,
        };
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }
}
