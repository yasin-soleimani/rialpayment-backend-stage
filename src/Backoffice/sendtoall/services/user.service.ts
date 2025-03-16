import { Injectable, successOptWithDataNoValidation, successOptWithPagination } from "@vision/common";
import { SendToAllCoreBackofficeService } from "../../../Core/sendtoall/services/backoffice.service";
import { LoginHistoryService } from "../../../Core/useraccount/history/login-history.service";
import { UserService } from "../../../Core/useraccount/user/user.service";
import { SendToAllUnauthorizedUsersDto } from "../dto/users.dto";
import { SendToAllListQueryBuilder, unauthorizedUsersQueryBuilder } from '../function/query-builder.func';
@Injectable()
export class BackofficeSendToAllUserService {

  constructor(
    private readonly userService: UserService,
    private readonly loginHistoryModel: LoginHistoryService,
    private readonly sendToAllService: SendToAllCoreBackofficeService
  ) { }

  async getLoginSystem(devicetype: string): Promise<any> {
    console.log(devicetype, 'dt')
    let userInfo = await this.loginHistoryModel.getAggregate([
      {
        $group: {
          _id: {
            user: '$user',
            devicetype: '$devicetype'
          }
        }
      }, {
        $match: {
          '_id.devicetype': devicetype
        }
      }, {
        $group: {
          _id: null,
          users: { $push: '$_id.user' },
          total: { $sum: 1 }
        }
      }
    ]);

    if (userInfo.length < 1) {
      userInfo[0] = {
        _id: null,
        users: []
      };
    }

    const data = await this.userService.getAggregate([
      {
        $match: {
          _id: { $nin: userInfo[0].users }
        }
      }, {
        $group: {
          _id: null,
          mobile: { $push: '$mobile' },
          total: { $sum: 1 }
        }
      }
    ])

    if (data.length > 0) {
      return successOptWithDataNoValidation({
        _id: null,
        total: data[0].total,
        mobiles: data[0].mobile
      })
    } else {
      return successOptWithDataNoValidation({
        _id: null,
        total: 0,
        mobiles: []
      });
    }
  }
  async getUnAuthorizedUsers(getInfo: SendToAllUnauthorizedUsersDto): Promise<any> {
    const query = unauthorizedUsersQueryBuilder(getInfo);
    const data = await this.userService.getAggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          mobile: { $push: '$mobile' },
          total: { $sum: 1 }
        }
      }
    ]);

    if (data.length > 0) {
      return successOptWithDataNoValidation({
        _id: null,
        total: data[0].total,
        mobile: data[0].mobiles
      })
    } else {
      return successOptWithDataNoValidation({
        _id: null,
        total: 0,
        mobile: []
      });
    }
  }

  async getList(getInfo, page: number, gid: string): Promise<any> {
    const query = SendToAllListQueryBuilder(getInfo, gid);
    const data = await this.sendToAllService.getPaginate(query, page);
    return successOptWithPagination(data);
  }

  async getLoggedIn(start, end): Promise<any> {
    return this.loginHistoryModel.getLoggedInUsers(start, end);
  }
}