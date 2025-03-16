import { BadRequestException, Injectable, NotFoundException } from '@vision/common';
import { ClubCoreService } from '../../customerclub/club.service';
import { SendAsanakSms } from '@vision/common/notify/sms.util';
import { SendtoallCoreDto } from '../dto/sendtoall.dto';
import { SendtoallType } from '../const/sendtoall-types.const';
import { GeneralService } from '../../service/general.service';
import { SendtoallCommonService } from './common.service';
import { sendNotif, SendNotification } from '@vision/common/notify/notify.util';
import { UserService } from '../../useraccount/user/user.service';

@Injectable()
export class SendtoallCustomerclubService {
  constructor(
    private readonly clubService: ClubCoreService,
    private readonly userService: UserService,
    private readonly commonService: SendtoallCommonService
  ) { }

  async submit(userid: string, getInfo: SendtoallCoreDto, users): Promise<any> {
    const clubInfo = await this.clubService.getClubInfo(userid);
    if (!clubInfo) throw new NotFoundException();

    switch (getInfo.type) {
      case SendtoallType.Sms: {
        if ((clubInfo.sms.password && clubInfo.sms.username, clubInfo.sms.number)) {
          this.AsanakSms(clubInfo, getInfo, users, userid);
        } else {
          this.IranianCompanySms(users, getInfo, userid);
        }
      }

      case SendtoallType.email: {
        break;
      }

      case SendtoallType.fax: {
        break;
      }

      case SendtoallType.notif: {
        this.sendNotif(users, getInfo, userid);
        break;
      }

      default: {
        throw new BadRequestException();
      }
    }
  }

  private async AsanakSms(clubInfo, getInfo, users, userid): Promise<any> {
    for (const info of users) {

      const userInfo = await this.userService.getInfoByMobile(info.mobile);
      let fullname = info.mobile;
      if (userInfo.fullname) fullname = userInfo.fullname
      const msg = getInfo.message.replace('fullname', fullname)


      SendAsanakSms(
        clubInfo.sms.username,
        clubInfo.sms.password,
        clubInfo.sms.number,
        '0' + info.mobile,
        msg
      ).then((res) => {
        this.commonService.addNew(
          info._id,
          msg,
          SendtoallType.Sms,
          info.mobile,
          info.fcm,
          info.groupname,
          info.gid,
          userid,
          'Asanak',
          clubInfo.sms.username,
          clubInfo.sms.password,
          clubInfo.sms.number,
          res[0].return.status
        );
      });
      await this.sleep(5000);
    }
  }

  async sleep(millis) {
    return new Promise((resolve) => setTimeout(resolve, millis));
  }
  private async IranianCompanySms(users, getInfo: SendtoallCoreDto, userid: string): Promise<any> {
    for (const info of users) {
      const userInfo = await this.userService.getInfoByMobile(info.mobile);
      let fullname = info.mobile;
      if (userInfo.fullname) fullname = userInfo.fullname
      const msg = getInfo.message.replace('fullname', fullname)

      SendAsanakSms(
        process.env.ASANAK_USERNAME,
        process.env.ASANAK_PASSWORD,
        process.env.ASANAK_NUMBER,
        '0' + info.mobile,
        msg
      ).then((res) => {
        this.commonService.addNew(
          info._id,
          msg,
          SendtoallType.Sms,
          info.mobile,
          info.fcm,
          info.groupname,
          info.gid,
          userid,
          'Asanak',
          process.env.ASANAK_USERNAME,
          process.env.ASANAK_PASSWORD,
          process.env.ASANAK_NUMBER,
          res[0].return.status
        );
      });

      await this.sleep(5000);
    }
  }

  private async sendNotif(users, getInfo: SendtoallCoreDto, userid: string): Promise<any> {
    for (const info of users) {

      const userInfo = await this.userService.getInfoByMobile(info.mobile);
      let fullname = info.mobile;
      if (userInfo.fullname) fullname = userInfo.fullname
      const msg = getInfo.message.replace('fullname', fullname)


      SendNotification(info.fcm, msg, 'تبلیغ').then((res) => {
        const rsp = JSON.parse(res);

        if (rsp.success == 1) {
          this.commonService.addNew(
            info._id,
            msg,
            SendtoallType.notif,
            info.mobile,
            info.fcm,
            info.groupname,
            info.gid,
            userid,
            'Notif',
            '',
            '',
            '',
            '0'
          );
        } else {
          this.commonService.addNew(
            info._id,
            getInfo.message,
            SendtoallType.notif,
            info.mobile,
            info.fcm,
            info.groupname,
            info.gid,
            userid,
            'Notif',
            '',
            '',
            '',
            '1'
          );
        }
      });
    }
  }
}
