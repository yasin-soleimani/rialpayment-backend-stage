import {
  Injectable,
  InternalServerErrorException,
  successOptWithDataNoValidation,
  successOptWithPagination,
} from '@vision/common';
import { UserService } from '../../Core/useraccount/user/user.service';
import { imageTransform } from '@vision/common/transform/image.transform';
import { AccountService } from '../../Core/useraccount/account/account.service';
import { loginAuthDto } from './dto/loginAuth.dto';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { LoginHistoryService } from '../../Core/useraccount/history/login-history.service';
import { TodayLocale, isoTime } from '@vision/common/utils/month-diff.util';
import { AuthService } from './auth.service';
import { MessagesCoreService } from '../../Core/messages/messages.service';
import { SettingsService } from '../../Core/settings/service/settings.service';
import { ClubCoreService } from '../../Core/customerclub/club.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

@Injectable()
export class UserApiService {
  constructor(
    private readonly userService: UserService,
    private readonly accountService: AccountService,
    private readonly messsageService: MessagesCoreService,
    private readonly settingsService: SettingsService,
    private readonly userAuthService: AuthService,
    private readonly loginHistoryService: LoginHistoryService,
    private readonly clubService: ClubCoreService
  ) {}

  async getSubSetList(userid, page): Promise<any> {
    const data = await this.userService.getUsersByRef(userid, page);
    let tempArray = [];
    if (data) {
      for (let i = 0; data.docs.length > i; i++) {
        let usergroup: any;
        if (data.docs[i].usergroup && data.docs[i].usergroup.group) {
          usergroup = {
            gid: data.docs[i].usergroup.group._id,
            title: data.docs[i].usergroup.group.title,
          };
        } else {
          usergroup = '';
        }

        tempArray.push({
          _id: data.docs[i]._id,
          avatar: imageTransform(data.docs[i].avatar),
          fullname: data.docs[i].fullname,
          account_no: data.docs[i].account_no,
          mobile: data.docs[i].mobile,
          nationalcode: data.docs[i].nationalcode,
          active: data.docs[i].active,
          usergroup: usergroup,
        });
      }
      console.log(tempArray);
      data.docs = tempArray;
    } else {
      data.docs = [];
    }

    return successOptWithPagination(data);
  }

  async searchByRefUsers(userid, page, search): Promise<any> {
    const data = await this.userService.searchUsersByRef(userid, page, search);
    let tempArray = [];
    if (data) {
      for (let i = 0; data.docs.length > i; i++) {
        let usergroup: any;
        if (data.docs[i].usergroup && data.docs[i].usergroup.group) {
          usergroup = {
            gid: data.docs[i].usergroup.group._id,
            title: data.docs[i].usergroup.group.title,
          };
        } else {
          usergroup = '';
        }

        tempArray.push({
          _id: data.docs[i]._id,
          avatar: imageTransform(data.docs[i].avatar),
          fullname: data.docs[i].fullname,
          account_no: data.docs[i].account_no,
          mobile: data.docs[i].mobile,
          nationalcode: data.docs[i].nationalcode,
          active: data.docs[i].active,
          usergroup: usergroup,
        });
      }
      console.log(tempArray);
      data.docs = tempArray;
    } else {
      data.docs = [];
    }

    return successOptWithPagination(data);
  }

  async findOperator(userid, mobile): Promise<any> {
    const data = await this.userService.findOperator(userid, mobile);
    return successOptWithDataNoValidation(data);
  }

  async loginState(getInfo: loginAuthDto, ip: String, req): Promise<any> {
    console.log('before check login');
    const data = await this.userService.checkLogin(getInfo, req);
    console.log('after check login');
    if (!data) throw new UserNotfoundException();
    console.log('before gift');
    await this.checkGift(data.user._id);
    console.log('before login history');
    await this.loginHistoryService.new(data.user._id, getInfo.devicetype, getInfo.deviceinfo, ip);
    console.log('before get credits');
    const creditbalance = await this.userAuthService.getCreditBalance(data.user._id);
    console.log('before unread');
    const unread = await this.messsageService.getUnreadMessages(data.user._id);
    console.log('before sitad');
    const sitad = await this.sitadStatus();
    console.log('before get info');
    const userInfo = await this.userService.getInfoByUserid(data.user);
    console.log('before clubinfo');
    const clubData = await this.getClubInfo(userInfo.ref);
    console.log('before club data');
    const clubUserData = await this.userService.getInfoByUserid(userInfo.ref);
    clubData.info = { ...clubData.info, about: clubUserData?.aboutme || '' };

    return AuthService.loginSuccess(
      data.user,
      data.token,
      creditbalance,
      sitad,
      data.myToken,
      data.staticamount,
      data.remainday,
      unread,
      clubData
    );
  }

  private async checkGift(userid): Promise<any> {
    const loginInfo = await this.loginHistoryService.checkUser(userid);
    if (loginInfo) return true;
    if (TodayLocale() < 13980105) {
      const userInfo = await this.userService.getInfoByUserid(userid);
      if (isoTime(userInfo.createdAt) < 1398) {
        this.oldUser(userInfo._id);
      } else {
        this.newUser(userInfo);
      }
    }
  }

  private async oldUser(userid): Promise<any> {
    this.accountService.accountSetLogg('عیدی سال 1398', 'Gift', 7000, true, null, userid);
    this.accountService.chargeAccount(userid, 'wallet', 7000);
  }

  private async newUser(userInfo): Promise<any> {
    if (userInfo.ref) {
      const refInfo = await this.userService.getInfoByUserid(userInfo.ref);
      if (!refInfo) return false;
      if (refInfo.refid == 'norooz') {
        this.accountService.accountSetLogg('عیدی سال 1398', 'Gift', 13980, true, null, userInfo._id);
        this.accountService.chargeAccount(userInfo._id, 'wallet', 13980);
      }
    }
  }

  async notExistsAccount(): Promise<any> {
    return this.userService.getNotExistsAccount();
  }

  async getReset(): Promise<any> {
    let counter = 1;
    const data = await this.userService.getUndefined().then((res) => {
      for (const info of res) {
        this.userService.unsetAuth(info._id).then((res) => {
          if (res) counter++;
        });
      }
    });
    console.log(counter);
  }

  async getInformtion(userid: string): Promise<any> {
    const data = await this.userService.getInfoByUserid(userid);
    if (!data) throw new InternalServerErrorException();
    if (data.access == false) throw new UserCustomException('دسترسی شما محدود شده است با پشتیبانی تماس بگیرید');
    const unread = await this.messsageService.getUnreadMessages(userid);
    const sitad = await this.sitadStatus();
    let clubData;
    let clubUserData;
    if (data.type == 'customerclub') {
      clubData = await this.getClubInfo(data._id);
      clubUserData = await this.userService.getInfoByUserid(data._id);
    } else {
      clubData = await this.getClubInfo(data.ref);
      clubUserData = await this.userService.getInfoByUserid(data.ref);
    }

    clubData.info = { ...clubData.info, about: clubUserData?.aboutme || '' };
    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      avatar: imageTransform(data.avatar),
      maxcheckout: data.maxcheckout,
      perday: data.perday,
      perhour: data.perhour,
      greeting: data.greeting || '',
      logourl: clubData.logo,
      clubname: clubData.clubname,
      account_no: data.account_no,
      sms: data.sms || false,
      cardno: data.card.cardno,
      fullname: data.fullname || '',
      refid: data.refid,
      sitad: sitad,
      unread: unread,
      apsdk: false,
      staticamount: false,
      checkout: data.checkout,
      mobile: data.mobile,
      clubinfo: clubData.info,
      type: data.type,
      vitrinAccess: data.vitrinAccess ?? false,
    };
  }

  async sitadStatus(): Promise<any> {
    const settings = await this.settingsService.get();
    let sitad = false;
    if (settings && settings.sitad) {
      sitad = settings.sitad;
    }
    return sitad;
  }

  async getClubInfo(ref: string): Promise<any> {
    const logo = process.env.SITE_ONLY_URL + 'assets/img/logo301.png';
    const clubName = 'ریال پیمنت';
    if (!ref)
      return {
        logo,
        clubname: clubName,
      };
    const clubData = await this.clubService.getInfoByOwnerId(ref);
    if (clubData) {
      if (clubData.logo) {
        return {
          logo: process.env.SITE_URL + clubData.logo,
          clubname: clubData.title,
          info: {
            tell: clubData.clubinfo.tell,
            website: clubData.clubinfo.website,
            email: clubData.clubinfo.email,
            fax: clubData.clubinfo.fax,
          },
        };
      }
      return {
        logo,
        clubname: clubName,
        info: {
          tell: clubData.clubinfo.tell,
          website: clubData.clubinfo.website,
          email: clubData.clubinfo.email,
          fax: clubData.clubinfo.fax,
        },
      };
    } else {
      return {
        logo,
        clubname: clubName,
        info: {},
      };
    }
  }
}
