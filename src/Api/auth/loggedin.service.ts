import { Injectable, InternalServerErrorException } from '@vision/common';
import { UserService } from '../../Core/useraccount/user/user.service';
import { AuthService } from './auth.service';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { ClubCoreService } from '../../Core/customerclub/club.service';
import { diffDays } from '@vision/common/utils/month-diff.util';
import { UserApiService } from './userapi.service';
import { getIp } from '../../Guard/ip.decoration';
import { TokenService } from '../../Core/useraccount/token/token.service';

@Injectable()
export class LoggedinService {
  constructor(
    private readonly userService: UserService,
    private readonly userApiService: UserApiService,
    private readonly userAuthService: AuthService,
    private readonly clubService: ClubCoreService,
    private readonly tokenService: TokenService
  ) {}

  async getLoggedin(userid, refid, req): Promise<any> {
    const data = await this.userService.getLoggedIn(userid, refid);
    if (!data) throw new UserNotfoundException();
    let remainday;
    if (data.type == 'customerclub') {
      const clubInfo = await this.clubService.getClubInfoByOwner(userid);
      const remainDays = diffDays(clubInfo.createdAt, clubInfo.expire);
      if (remainDays < 0) throw new UserNotfoundException('مدت زمان استفاده از باشگاه به پایان رسیده است');
      remainday = remainDays;
    }
    const userRequest = getIp(req);
    const token = await this.userService.createToken(data._id, userRequest.userAgent, userRequest.ip);
    const creditBalance = await this.userAuthService.getCreditBalance(userid);
    const sitad = await this.userApiService.sitadStatus();
    const clubData = await this.userApiService.getClubInfo(data._id);
    return AuthService.loginSuccess(data, token, creditBalance, sitad, '', '', remainday, 0, clubData);
  }
}
