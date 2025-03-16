import { Injectable } from '@vision/common';
import { SendtoallCoreDto } from '../dto/sendtoall.dto';
import { GeneralService } from '../../service/general.service';
import { SendAsanakSms } from '@vision/common/notify/sms.util';
import { SendtoallCommonService } from './common.service';
import { SendtoallType } from '../const/sendtoall-types.const';
import { SendNotification } from '@vision/common/notify/notify.util';
import { UserService } from '../../useraccount/user/user.service';

@Injectable()
export class SendtoAllAgentService {
  constructor(
    private readonly generalService: GeneralService,
    private readonly commonService: SendtoallCommonService,
    private readonly userService: UserService
  ) { }

  async submit(users, getInfo: SendtoallCoreDto, userid): Promise<any> {
    switch (getInfo.type) {
      case SendtoallType.Sms: {
        this.sendSMS(getInfo, users, userid);
        break;
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
    }
  }
  async sleep(millis) {
    return new Promise((resolve) => setTimeout(resolve, millis));
  }
  private async sendSMS(getInfo: SendtoallCoreDto, users, userid): Promise<any> {
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
      )
        .then((res) => {
          console.log(res, 'res');
          this.commonService.addNew(
            info._id,
            getInfo.message,
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
        })
        .catch((err) => console.log(err, 'err'));
      this.sleep(5000);
    }
  }

  private async sendNotif(users, getInfo: SendtoallCoreDto, userid: string): Promise<any> {
    for (const info of users) {
      const userInfo = await this.userService.getInfoByMobile(info.mobile);
      let fullname = info.mobile;
      if (userInfo.fullname) fullname = userInfo.fullname
      const msg = getInfo.message.replace('fullname', fullname)
      SendNotification(info.fcm, msg, 'پیام تبلیغاتی').then((res) => {
        const rsp = JSON.parse(res);

        if (rsp.success == 1) {
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
