import { Injectable, InternalServerErrorException, successOpt } from '@vision/common';
import { AccountService } from '../../Core/useraccount/account/account.service';
import { UserService } from '../../Core/useraccount/user/user.service';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';

@Injectable()
export class BackofficeAccountService {
  constructor(private readonly accountService: AccountService, private readonly userService: UserService) {}

  async Charge(userid: string, amount: number, description: string): Promise<any> {
    const userInfo = await this.userService.getInfoByUserid(userid);
    if (!userInfo) throw new UserNotfoundException();

    return this.accountService.chargeAccount(userid, 'wallet', amount).then((res) => {
      if (!res) throw new InternalServerErrorException();
      const title = 'شارژ کیف توسط مدیریت ' + description;
      this.accountService.accountSetLogg(title, 'System', amount, true, null, userid);
      return successOpt();
    });
  }

  async deCharge(userid: string, amount: number, description: string): Promise<any> {
    const userInfo = await this.userService.getInfoByUserid(userid);
    if (!userInfo) throw new UserNotfoundException();

    return this.accountService.dechargeAccount(userid, 'wallet', amount).then((res) => {
      if (!res) throw new InternalServerErrorException();
      const title = 'کسر از کیف توسط مدیریت ' + description;
      this.accountService.accountSetLogg(title, 'System', amount, true, null, userid);
      return successOpt();
    });
  }
}
