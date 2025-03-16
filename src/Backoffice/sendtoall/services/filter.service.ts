import { Injectable, successOptWithDataNoValidation, successOptWithPagination } from "@vision/common";
import { UserCustomException } from "@vision/common/exceptions/userCustom.exception";
import { GroupCoreService } from "../../../Core/group/group.service";
import { UserService } from "../../../Core/useraccount/user/user.service";
import { SendToAllFilterTypeConst } from "../const/filter.const";
import { SendToAllBackofficeDto } from "../dto/send.dto";
import { SendToAllUnauthorizedUsersDto } from "../dto/users.dto";
import { UserTypeSendToAllAueryBuilder } from "../function/query-builder.func";
import { BackofficeSendToAllUserService } from "./user.service";

@Injectable()
export class BackofficeSendToAllFilterService {

  constructor(
    private readonly userService: UserService,
    private readonly groupService: GroupCoreService,
    private readonly unAuthorizedService: BackofficeSendToAllUserService
  ) { }


  async getFilter(getInfo: SendToAllBackofficeDto, page: number): Promise<any> {
    if (getInfo.type == SendToAllFilterTypeConst.UnAuthorized) {
      return this.unAuthorizedService.getUnAuthorizedUsers(getInfo);
    } else if (getInfo.type == SendToAllFilterTypeConst.CustomerClub) {
      return this.getUser(getInfo, page);
    } else if (getInfo.type == SendToAllFilterTypeConst.AppLogin) {
      return this.unAuthorizedService.getLoginSystem('mobile');
    } else if (getInfo.type == SendToAllFilterTypeConst.PwaLogin) {
      return this.unAuthorizedService.getLoginSystem('pwa');
    } else if (getInfo.type == SendToAllFilterTypeConst.WebLogin) {
      return this.unAuthorizedService.getLoginSystem('web');
    } else {
      throw new UserCustomException('نوع تعریف نشده')
    }
  }

  async getUser(getInfo: SendToAllBackofficeDto, page: number): Promise<any> {
    const query = UserTypeSendToAllAueryBuilder(getInfo);
    const data = await this.userService.getPaginateAggregate(page, [
      { $match: query },
      {
        $project: {
          fullname: 1,
          mobile: 1,
          type: 1,
        }
      }
    ]);
    return successOptWithPagination(data);
  }

  async getAllGroupUsers(getInfo: SendToAllBackofficeDto, userId: string): Promise<any> {
    const tmpArray = Array();
    const users = await this.groupService.getUsersPopUsers(getInfo.group);
    const groupInfo = await this.groupService.getInfoById(getInfo.group);
    if (!groupInfo) throw new UserCustomException('گروه یافت نشد', false, 404);
    for (const info of users) {
      if (info.user) {
        tmpArray.push({
          _id: info.user._id,
          mobile: info.user.mobile,
          fullname: info.user.fullname || "بی نام",
          fcm: info.user.fcm,
          gid: info.group._id,
          groupname: info.group.title,
        });
      }
    }

    return {
      users: tmpArray,
      group: groupInfo
    };

  }

  async getGroup(userId: string): Promise<any> {
    const data = await this.groupService.getGroupAll(userId);
    return successOptWithDataNoValidation(data);
  }
}