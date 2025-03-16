import { BadRequestException, Injectable } from "@vision/common";
import { SendNotification } from "@vision/common/notify/notify.util";
import { SendAsanakSms } from "@vision/common/notify/sms.util";
import { UserService } from "../../useraccount/user/user.service";
import { SendtoallType } from "../const/sendtoall-types.const";
import { SendtoallCommonService } from "./common.service";

@Injectable()
export class SendToAllCoreBackofficeService {

  constructor(
    private readonly commonService: SendtoallCommonService,
    private readonly userService: UserService
  ) { }

  async getPaginate(query: any, page: number): Promise<any> {
    return this.commonService.getPaginateQuery(query, page);
  }

  async submit(users: any[], message: string, group: any, userId: string, type: number, clubInfo: any): Promise<any> {
    switch (type) {
      case SendtoallType.Sms: {
        if (clubInfo) return this.customerClubSms(userId, users, message, group, clubInfo);
        this.customerClubIranianSms(userId, users, message, group);
        break;
      }

      case SendtoallType.notif: {
        this.sendNotif(userId, users, message, group);
        break;
      }

      default:
        throw new BadRequestException();
    }
  }

  private async sleep(millis) {
    return new Promise((resolve) => setTimeout(resolve, millis));
  }

  private async customerClubIranianSms(userId: string, users: any[], message: string, group: any): Promise<any> {
    let i = 1;
    let tmp = Array();
    for (const userx of users) {
      const user = await this.userService.findByMobile(userx);
      tmp.push("0" + user.mobile);
      i++;
      if (i == 100) {
        SendAsanakSms(process.env.ASANAK_USERNAME, process.env.ASANAK_PASSWORD, process.env.ASANAK_NUMBER, tmp, message)
          .then(async res => {
            for (const item of tmp) {
              const user = await this.userService.findByMobile(item);
              await this.commonService.addNew(
                user._id, message, SendtoallType.Sms, user.mobile, user.fcm, group.title, group._id,
                userId, 'Asanak', process.env.ASANAK_USERNAME, process.env.ASANAK_PASSWORD, process.env.ASANAK_NUMBER, '0')
            }

          });
        i = 1;
        tmp = []
        tmp.length = 0;
        await this.sleep(20000);
      }
    }
  }

  private async customerClubSms(userId: string, users: any[], message: string, group: any, clubInfo): Promise<any> {
    let i = 1;
    let tmp = Array();
    for (const userx of users) {
      const user = await this.userService.findByMobile(userx);
      tmp.push("0" + user.mobile);
      i++;
      if (i == 100) {
        SendAsanakSms(clubInfo.sms.username,
          clubInfo.sms.password,
          clubInfo.sms.number, "0" + user.mobile, message)
          .then(async res => {
            for (const item of tmp) {
              const user = await this.userService.findByMobile(item);
              await this.commonService.addNew(
                user._id, message, SendtoallType.Sms, user.mobile, user.fcm, group.title, group._id,
                userId, 'Asanak', process.env.ASANAK_USERNAME, process.env.ASANAK_PASSWORD, process.env.ASANAK_NUMBER, '0')
            }

          });
        i = 1;
        tmp = [];
        tmp.length = 0;
        await this.sleep(20000);
      }

    }
  }

  private async sendNotif(userId: string, users: any[], message: string, group): Promise<any> {
    for (const userx of users) {
      const user = await this.userService.findByMobile(userx)
      SendNotification(user.fcm, message, "تبلیغ").then((res) => {
        const rsp = JSON.parse(res);
        if (rsp.success == 1) {
          this.commonService.addNew(user._id, message, SendtoallType.notif, user.mobile, user.fcm, group.title, group._id, userId, null, null, null, null, '0')
        }
      })
    }
  }
}