import { UserTypeConst } from "../const/userType.const";
import { SendToAllUnauthorizedUsersDto, SendToAllUsersFilterDto } from "../dto/users.dto";

export const unauthorizedUsersQueryBuilder = (getInfo: SendToAllUnauthorizedUsersDto) => {
  if (Number(getInfo.start) > 0 && Number(getInfo.end) > 0) {
    return {
      $and: [{ fullname: { $exists: false } }, {
        createdAt: { $gte: new Date(getInfo.start), $lte: new Date(getInfo.end) },
      }]
    }
  } else {
    return { fullname: { $exists: false } }
  }
}

export const UserTypeSendToAllAueryBuilder = (getInfo: SendToAllUsersFilterDto) => {
  let query = Array();
  if (getInfo.mobile && getInfo.mobile.length > 0) {
    query.push({
      mobile: Number(getInfo.mobile)
    })
  }
  if (getInfo.type == UserTypeConst.user.code) {
    query.push({
      type: UserTypeConst.user.value
    })
  } else {
    query.push({
      type: UserTypeConst.club.value
    })
  }

  return { $and: query }
}

export const UserTypeSelector = (type: number) => {
  if (type == 1) return 'user';
  return 'customerclub'
}

export const SendToAllListQueryBuilder = (getInfo, groupId) => {
  if (Number(getInfo.start) > 0 && Number(getInfo.end) > 0) {
    return {
      gid: groupId,
      createdAt: {
        $gte: new Date(getInfo.start),
        $lte: new Date(getInfo.end)
      }
    };
  }
  else {
    return {
      gid: groupId
    };
  }
}