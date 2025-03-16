import { Injectable, successOpt, successOptWithDataNoValidation } from '@vision/common';
import { BackofficeLoginDto } from './dto/login.dto';
import { UserService } from '../../Core/useraccount/user/user.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { invalidUserPassException } from '@vision/common/exceptions/invalid-userpass.exception';
import { GeneralService } from '../../Core/service/general.service';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import * as securePin from 'secure-pin';
import { getIp } from '../../Guard/ip.decoration';

@Injectable()
export class BackofficeAuthService {
  constructor(private readonly userService: UserService, private readonly generalService: GeneralService) {}

  async login(getInfo: BackofficeLoginDto, req): Promise<any> {
    const info = await this.userService.getInfoByMobile(getInfo.mobile);
    if (!info) throw new UserCustomException('کاربر یافت نشد');

    if (info.type != 'admin') throw new UserCustomException('کاربر یافت نشد');

    const valid = await this.userService.compareHash(getInfo.password, info.password);
    if (!valid) throw new invalidUserPassException();

    const randno = securePin.generatePinSync(4);
    const msgBody = 'کد ورود به سامانه ' + randno;
    this.generalService.AsanaksendSMS('', '', '', '0' + info.mobile, msgBody);
    this.userService.findByIdAndUpdateCode(info._id, randno);
    return successOpt();
  }

  async verify(getInfo: BackofficeLoginDto, req: any): Promise<any> {
    const userInfo = await this.userService.getInfoByMobile(getInfo.mobile);
    if (!userInfo) throw new UserNotfoundException();

    if (userInfo.type != 'admin') throw new UserNotfoundException();

    const valid = await this.userService.compareHash(getInfo.password, userInfo.password);
    if (!valid) throw new invalidUserPassException();

    if (userInfo.acode != getInfo.acode) throw new UserCustomException('کد اشتباه می باشد');
    const userRequest = getIp(req);
    const token = await this.userService.createToken(userInfo._id, userRequest.userAgent, userRequest.ip);
    const data = {
      fullname: userInfo.fullname,
      mobile: userInfo.mobile,
      token: token.accessToken,
    };

    return successOptWithDataNoValidation(data);
  }
}
