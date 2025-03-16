import { faildOpt, Injectable, InternalServerErrorException, successOpt } from '@vision/common';
import { RegisterUserService } from '../../Core/useraccount/register/resgiter-user.service';
import { UserService } from '../../Core/useraccount/user/user.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { ClubPwaService } from '../../Core/clubpwa/club-pwa.service';

@Injectable()
export class MemberService {
  constructor(
    private readonly userRegisterService: RegisterUserService,
    private readonly userService: UserService,
    private readonly clubPwaService: ClubPwaService
  ) {}

  async register(getInfo, referer: string): Promise<any> {
    if (referer) {
      const clubData = await this.clubPwaService.getClubPwaByReferer(referer);
      if (clubData) {
        getInfo.ref = clubData.clubUser.refid;
      }
    }
    return this.userRegisterService.newMethodRegister(getInfo.mobile, getInfo.password, getInfo.ref);
  }

  async authUser(getInfo, userid): Promise<any> {
    const userInfo = await this.userService.getInfoByUserid(userid);
    if (!userInfo) throw new UserCustomException('دسترسی غیرمجاز');
    if (userInfo.fullname) throw new UserCustomException('دسترسی غیرمجاز');
    return this.userRegisterService.authUser(getInfo.nationalcode, getInfo.birthdate, userid, getInfo.type);
  }

  async setUserSmsStatus(userid: string, status: boolean): Promise<any> {
    return this.userService
      .setUserSmsStatus(userid, status)
      .then((res) => {
        if (res) return successOpt();
        return faildOpt();
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }
}
