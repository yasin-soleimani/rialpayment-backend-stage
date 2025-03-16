import { Injectable, successOpt } from "@vision/common";
import { UserCustomException } from "@vision/common/exceptions/userCustom.exception";
import { ClubCoreService } from "../../../Core/customerclub/club.service";
import { SendToAllCoreBackofficeService } from "../../../Core/sendtoall/services/backoffice.service";
import { SendToAllFilterTypeConst } from "../const/filter.const";
import { SendToAllBackofficeDto } from "../dto/send.dto";
import { BackofficeSendToAllFilterService } from "./filter.service";
import { BackofficeSendToAllUserService } from "./user.service";

@Injectable()
export class BackofficeSendToAllSendMessageService {

  constructor(
    private readonly filterService: BackofficeSendToAllFilterService,
    private readonly userService: BackofficeSendToAllUserService,
    private readonly clubService: ClubCoreService,
    private readonly sendToAllService: SendToAllCoreBackofficeService,
  ) { }

  async action(userId: string, getInfo: SendToAllBackofficeDto): Promise<any> {
    if (getInfo.type == SendToAllFilterTypeConst.UnAuthorized) {
      const users = await this.userService.getUnAuthorizedUsers(getInfo);
      const group = {
        _id: null,
        title: 'کاربران ثبت نام نشده'
      }
      this.sendToAllService.submit(users, getInfo.message, group, userId, getInfo.sendType, null);
      return successOpt();
    } else if (getInfo.type == SendToAllFilterTypeConst.CustomerClub) {
      const data = await this.filterService.getAllGroupUsers(getInfo, userId);
      const clubInfo = await this.clubService.getInfoByOwnerId(data.group.user);
      this.sendToAllService.submit(data.users, getInfo.message, data.group, userId, getInfo.sendType, clubInfo);

      return successOpt();

    } else if (getInfo.type == SendToAllFilterTypeConst.AppLogin) {
      const users = await this.userService.getLoginSystem('mobile');
      const group = {
        _id: null,
        title: 'Mobile '
      }
      this.sendToAllService.submit(users.data.mobiles, getInfo.message, group, userId, getInfo.sendType, null);
      return successOpt();
    } else if (getInfo.type == SendToAllFilterTypeConst.PwaLogin) {
      const users = await this.userService.getLoginSystem('pwa');
      const group = {
        _id: null,
        title: 'Pwa '
      }
      this.sendToAllService.submit(users.data.mobiles, getInfo.message, group, userId, getInfo.sendType, null);
      return successOpt();
    } else if (getInfo.type == SendToAllFilterTypeConst.WebLogin) {
      const users = await this.userService.getLoginSystem('web');
      const group = {
        _id: null,
        title: 'Web '
      }
      this.sendToAllService.submit(users.data.mobiles, getInfo.message, group, userId, getInfo.sendType, null);
      return successOpt();
    } else if (getInfo.type == SendToAllFilterTypeConst.CampaignBIS) {
      const users = await this.userService.getLoggedIn(getInfo.start, getInfo.end);

      const group = {
        _id: null,
        title: 'BIS '
      }
      this.sendToAllService.submit(users.data.mobiles, getInfo.message, group, userId, getInfo.sendType, null);
      return successOpt();
    } else {
      throw new UserCustomException('نوع تعریف نشده')
    }

  }
}