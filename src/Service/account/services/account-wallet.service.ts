import { Injectable, successOpt } from '@vision/common';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { AuthorizeUserzCoreService } from '../../../Core/authorize/user/user.service';
import { AuthorizeClientCoreService } from '../../../Core/authorize/client/client.service';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { AuthorizeAccountPaymentDto } from '../dto/account-payment.dto';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { AuthorizeRequestCoreService } from '../../../Core/authorize/request/request.service';
import { AuthorizeAccountTokenConst } from '../const/token-type.const';
import { Request } from 'express';
import { AuthorizeAccountCheckIp } from '../functions/check-ip.function';
import { AccountBlockService } from '../../../Core/useraccount/account/services/account-block.service';

@Injectable()
export class AuthorizeAccountWalletService {
  constructor(
    private readonly accountService: AccountService,
    private readonly blockAccountService: AccountBlockService,
    private readonly authUserService: AuthorizeUserzCoreService,
    private readonly authClientService: AuthorizeClientCoreService,
    private readonly authRequestService: AuthorizeRequestCoreService,
    private readonly userService: UserService
  ) {}

  async play(getInfo: AuthorizeAccountPaymentDto, req: Request): Promise<any> {
    return this.checkValidation(getInfo, req.ip);
  }

  private async checkValidation(getInfo: AuthorizeAccountPaymentDto, ip): Promise<any> {
    const tokenInfo = await this.authRequestService.getToken(getInfo.token);
    if (!tokenInfo) throw new UserCustomException('توکن نامعتبر', false, 400);

    if (tokenInfo.type != AuthorizeAccountTokenConst.payment) throw new UserCustomException('توکن نامعتبر', false, 400);

    const clientInfo = await this.userService.getInfoByAccountNo(getInfo.accid);
    if (!clientInfo) throw new UserCustomException('کاربر یافت نشد', false, 404);

    if (clientInfo.block == true || clientInfo.checkout == false || clientInfo.access == false)
      throw new UserCustomException('کاربر مجاز به انجام تراکنش نمی باشد', false, 401);
    const userInfo = await this.authClientService.getInfoByUserId(clientInfo._id, tokenInfo.auth);
    if (!userInfo) throw new UserCustomException('کاربر مجاز به انجام تراکنش نمی باشد', false, 401);

    const authInfo = await this.authUserService.getInfoByApiKey(tokenInfo.apikey);

    await AuthorizeAccountCheckIp(authInfo.ip, ip);

    await this.checkBalance(clientInfo._id, getInfo.amount);

    await this.accountService.dechargeAccount(clientInfo._id, 'wallet', getInfo.amount);
    await this.accountService.chargeAccount(authInfo.user, 'wallet', getInfo.amount);

    const title = 'خرید مستقیم از ' + authInfo.website;
    await this.accountService.accountSetLogg(title, 'AuthTrans', getInfo.amount, true, clientInfo._id, authInfo.user);
    return successOpt();
  }

  private async checkBalance(userid: string, amount: number): Promise<any> {
    const wallet = await this.accountService.getBalance(userid, 'wallet');
    const block = await this.blockAccountService.getBlock(userid);
    const today = await this.accountService.getTodayCharge(userid);

    const total = wallet.balance - block[0].total - today[0].total;
    if (total < amount) throw new UserCustomException('عدم موجودی', false, 405);
  }
}
