import { Injectable, successOpt, successOptWithPagination } from '@vision/common';
import { SendtoallDto } from '../dto/sendtoall.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { GroupCoreService } from '../../../Core/group/group.service';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { SendtoallCoreService } from '../../../Core/sendtoall/sendtoall.service';
import { SendtoallType } from '../../../Core/sendtoall/const/sendtoall-types.const';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { ClubCoreService } from '../../../Core/customerclub/club.service';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { notEnoughMoneyException } from '@vision/common/exceptions/notEnoughMoney.exception';

@Injectable()
export class SendtoallService {
  constructor(
    private readonly groupUsersService: GroupCoreService,
    private readonly userService: UserService,
    private readonly sendtoAllService: SendtoallCoreService,
    private readonly clubService: ClubCoreService,
    private readonly accountService: AccountService
  ) {}

  async submit(getInfo: SendtoallDto, userid, role): Promise<any> {
    await this.calc(getInfo, userid, role);

    if (getInfo.sms == 'true') {
      this.sendSms(getInfo, userid, role);
    }

    if (getInfo.notif == 'true') {
      this.sendNotif(getInfo, userid, role);
    }

    return {
      status: 200,
      success: true,
      message: 'درخواست شما با موفقیت ثبت شد',
    };
  }

  private async calc(getInfo: SendtoallDto, userid, role): Promise<any> {
    let total = 0;
    const users = await this.getUsersInfo(getInfo, userid);
    const messageCount = Math.ceil(getInfo.message.length / 70);

    if (getInfo.sms == 'true') {
      if (role == 'customerclub') {
        const clubInfo = await this.clubService.getClubInfo(userid);
        if (!clubInfo.sms.password || (!clubInfo.sms.username && !clubInfo.sms.number)) {
          total = users.length * (messageCount * Number(process.env.CLUB_NOTIF_PRICE));
        }
      } else {
        total = users.length * (messageCount * Number(process.env.CLUB_NOTIF_PRICE));
      }

      if (total > 0) {
        const wallet = await this.accountService.getBalance(userid, 'wallet');
        if (wallet.balance < total) throw new notEnoughMoneyException();
        this.accountService.dechargeAccount(userid, 'wallet', total);
        const title = ' هزینه ارسال پیامک تبلیغاتی به تعداد' + users.length;
        this.accountService.accountSetLogg(title, 'Ads', total, true, userid, null);
      }
    }

    if (getInfo.notif == 'true') {
      const max = users.length * Number(process.env.CLUB_NOTIF_PRICE);
      if (max > 0) {
        const wallet = await this.accountService.getBalance(userid, 'wallet');
        if (wallet.balance < max) throw new notEnoughMoneyException();
        this.accountService.dechargeAccount(userid, 'wallet', max);
        const title = 'هزینه ارسال نوتیف تبلیغاتی به تعداد ' + users.length;
        this.accountService.accountSetLogg(title, 'Ads', max, true, userid, null);
      }
    }
  }

  private async sendSms(getInfo: SendtoallDto, userid: string, role: string): Promise<any> {
    this.getUsersInfo(getInfo, userid).then((res) => {
      getInfo.type = SendtoallType.Sms;
      this.sendtoAllService.submit(getInfo, res, userid, role);
    });
  }

  private async sendNotif(getInfo: SendtoallDto, userid: string, role: string): Promise<any> {
    this.getUsersInfo(getInfo, userid).then((res) => {
      getInfo.type = SendtoallType.notif;
      this.sendtoAllService.submit(getInfo, res, userid, role);
    });
  }

  private async getUsersInfo(getInfo: SendtoallDto, userid: string): Promise<any> {
    const groupInfo = await this.groupUsersService.getInfo(getInfo.gid, userid);
    if (!groupInfo) throw new UserCustomException('درخواست شما نامعتبر می باشد');

    let tmpArray = Array();
    if (isEmpty(getInfo.users)) {
      const users = await this.groupUsersService.getUsersPopUsers(getInfo.gid);

      for (const info of users) {
        if (info.user) {
          tmpArray.push({
            _id: info.user._id,
            mobile: info.user.mobile,
            fullname: info.user.fullname || 'بی نام',
            fcm: info.user.fcm,
            gid: info.group._id,
            groupname: info.group.title,
          });
        }
      }

      return tmpArray;
    } else {
      const users = getInfo.users.split(',');

      for (const info of users) {
        const userInfo = await this.userService.getInfoByUserid(info);
        if (userInfo) {
          tmpArray.push({
            _id: userInfo._id,
            mobile: userInfo.mobile,
            fullname: userInfo.fullname || 'بی نام',
            fcm: userInfo.fcm,
            gid: groupInfo._id,
            groupname: groupInfo.title,
          });
        }
      }
    }

    return tmpArray;
  }

  async getList(userid: string, page: number, gid: string): Promise<any> {
    const data = await this.sendtoAllService.getList(userid, page, gid);
    console.log(data, 'data');
    let tmpArray = Array();

    for (const info of data.docs) {
      let status = 'عملیات با خطا مواجه شده است';
      if (info.status == 0) {
        status = 'عملیات با موفقیت انجام شده است';
      }
      tmpArray.push({
        fullname: info.user.fullname || 'بی نام',
        mobile: info.mobile,
        sourceno: info.sourceno,
        message: info.message,
        status: status,
        createdAt: info.createdAt,
        type: info.type,
      });
    }

    data.docs = tmpArray;
    return successOptWithPagination(data);
  }
}
