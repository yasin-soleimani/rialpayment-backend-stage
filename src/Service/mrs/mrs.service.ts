import { Injectable, successOptWithData, successOptWithDataNoValidation } from '@vision/common';
import { UserService } from '../../Core/useraccount/user/user.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { MipgCoreService } from '../../Core/mipg/mipg.service';

@Injectable()
export class ServiceMrsService {
  constructor(private readonly userService: UserService, private readonly mipgService: MipgCoreService) {}

  async getUserInfoByMobile(mobile: number): Promise<any> {
    const userInfo = await this.userService.getInfoByMobile(mobile);
    if (!userInfo) throw new UserCustomException('یافت نشد', false, 404);
    console.log(userInfo, 'userInfo');
    return successOptWithDataNoValidation({
      fullname: userInfo.fullname || '',
      mobile: mobile,
    });
  }

  async setUSerTerminalIpg(getInfo): Promise<any> {
    return this.mipgService
      .addNewMrs(getInfo.acceptorid, getInfo.terminalid, getInfo.psp, getInfo.title, getInfo.mobile)
      .then((res) => {
        console.log(res, 'res data');
        return res;
      });
  }
}
