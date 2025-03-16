import { Injectable, successOptWithDataNoValidation } from "@vision/common";
import { Types } from "mongoose";
import { LoginHistoryService } from "../../../Core/useraccount/history/login-history.service";
import { UserService } from "../../../Core/useraccount/user/user.service";

@Injectable()
export class SendToAllLoginApiService {

  constructor(
    private readonly loginHistoryModel: LoginHistoryService,
    private readonly userService: UserService
  ) { }
  async getLoginSystem(devicetype: string, ref): Promise<any> {
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

    let ObjId = Types.ObjectId;

    const data = await this.userService.getAggregate([
      {
        $match: {
          _id: { $nin: userInfo[0].users },
          ref: ObjId(ref)
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

}