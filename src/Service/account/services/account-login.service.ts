import { Injectable, successOpt } from '@vision/common';
import { AuthorizeUserzCoreService } from '../../../Core/authorize/user/user.service';
import { AuthorizeClientCoreService } from '../../../Core/authorize/client/client.service';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { AuthorizeAccountLoginDto } from '../dto/account.dto';
import { Response, Request } from 'express';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { AuthorizeAccountPermisionDto } from '../dto/account-permision.dto';
import { AuthorizeRequestCoreService } from '../../../Core/authorize/request/request.service';
import { toggleBoolean } from '../functions/toggle.function';
import { AuthorizeAccountTokenConst } from '../const/token-type.const';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { Req } from '@vision/common/decorators/http/route-params.decorator';
import { imageTransform } from '@vision/common/transform/image.transform';
import * as uniqid from 'uniqid';

@Injectable()
export class AuthorizeAccountLoginService {
  constructor(
    private readonly authUserService: AuthorizeUserzCoreService,
    private readonly authClientService: AuthorizeClientCoreService,
    private readonly userService: UserService,
    private readonly authRequestService: AuthorizeRequestCoreService
  ) {}

  async getLogin(getInfo: AuthorizeAccountLoginDto, req: Request): Promise<any> {
    if (isEmpty(getInfo.token)) throw new FillFieldsException();

    const reqInfo = await this.authRequestService.getToken(getInfo.token);
    if (!reqInfo) throw new UserCustomException('توکن نامعتبر ی باشد');

    if (reqInfo.type != AuthorizeAccountTokenConst.login) throw new UserCustomException('توکن نامعتبر ی باشد');

    const userInfo = await this.authUserService.getInfoByApiKey(reqInfo.apikey);
    if (!userInfo) throw new UserCustomException('اطلاعات نامعتبر');
    const clientInfo = await this.userService.getInfoByMobile(getInfo.mobile);
    if (!clientInfo) throw new UserCustomException('اطلاعات نامعتبر');
    const validate = await this.userService.compareHash(getInfo.password, clientInfo.password);
    if (!validate) throw new UserCustomException('اطلاعات نامعتبر');

    if (isEmpty(clientInfo.fullname)) throw new UserCustomException('به دلیل عدم احراز هویت مجاز به استفاده نمی باشد');

    const authInfo = await this.authRequestService.pureQuery(
      { token: getInfo.token },
      {
        $set: {
          user: clientInfo._id,
          req: {
            mobile: getInfo.mobile,
            ip: req.ip,
          },
        },
      }
    );

    const checkLoggedIn = await this.authClientService.getInfoByUserId(clientInfo._id, userInfo._id);
    if (!checkLoggedIn) {
      return {
        status: 202,
        success: true,
        message: 'عملیات با موفقیت انجام شد',
        data: {
          fullname: clientInfo.fullname,
          avatar: imageTransform(clientInfo.avatar),
          mobile: clientInfo.mobile,
          website: userInfo.website,
          logo: imageTransform(userInfo.logo),
          title: userInfo.title,
          reqid: authInfo._id,
        },
      };
    }

    await this.authRequestService.pureQuery({ token: getInfo.token }, { $set: { success: true } });
    return {
      status: 200,
      success: false,
      message: 'عملیات با موفقیت انجام شد',
      reqid: authInfo._id,
    };
  }

  async setPermissionApi(getInfo: AuthorizeAccountPermisionDto, @Req() req: Request): Promise<any> {
    if (isEmpty(getInfo.reqid)) throw new UserCustomException('توکن نامعتبر می باشد');

    const reqInfo = await this.authRequestService.getInfo(getInfo.reqid);
    if (!reqInfo) throw new UserCustomException('توکن نامعتبر می باشد');

    const authInfo = await this.authRequestService.update(
      getInfo.reqid,
      true,
      toggleBoolean(getInfo.wallet),
      getInfo.maxbuy
    );
    const userInfo = await this.authUserService.getInfoByApiKey(authInfo.apikey);
    const clientInfo = await this.userService.getInfoByMobile(authInfo.mobile);

    return this.authClientService
      .submit(reqInfo.user, reqInfo.auth, getInfo.wallet, getInfo.maxbuy, true)
      .then((res) => {
        if (!res) throw new UserCustomException('عملیات با خطا مواجه شده است');
        return {
          status: 200,
          success: true,
          message: 'عملیات با موفقیت انجام شد',
          reqid: authInfo._id,
        };
      });
  }

  async redirect(reqid: string, res: Response): Promise<any> {
    const reqInfo = await this.authRequestService.getInfo(reqid);

    const userInfo = await this.authUserService.getInfoByApiKey(reqInfo.apikey);
    const clientInfo = await this.userService.getInfoByMobile(reqInfo.req.mobile);
    const authInfo = await this.authClientService.getInfoByUserId(reqInfo.user, reqInfo.auth);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`
    <form action="${userInfo.callback}" method="post" id="account_sumit">
      <input type="hidden" name="fullname" value="${clientInfo.fullname}" />
      <input type="hidden" name="birthdate" value="${clientInfo.birthdate}" />
      <input type="hidden" name="mobile" value="${clientInfo.mobile}" />
      <input type="hidden" name="accid" value="${clientInfo.account_no}" />
      <input type="hidden" name="payment" value="${authInfo.permissions.buy.status}" />
      <input type="hidden" name="maxpayment" value="${authInfo.permissions.buy.max}" />
    </form>
    <script type="text/javascript">
    var f=document.getElementById('account_sumit');
    f.submit();
    </script>
    `);
    res.end();
  }

  async setPermission(getInfo: AuthorizeAccountPermisionDto, res: Response, req: Request): Promise<any> {
    if (isEmpty(getInfo.reqid)) res.redirect(301, 'https://account.rialpayment.ir/auth/error');

    const reqInfo = await this.authRequestService.getInfo(getInfo.reqid);
    if (!reqInfo) res.redirect(301, 'https://account.rialpayment.ir/auth/error');

    if (isEmpty(getInfo.info) || isEmpty(getInfo.wallet))
      return {
        status: 200,
        success: true,
        reqid: getInfo.reqid,
      };

    const authInfo = await this.authRequestService.update(
      getInfo.reqid,
      true,
      toggleBoolean(getInfo.wallet),
      getInfo.maxbuy
    );
    const userInfo = await this.authUserService.getInfoByApiKey(authInfo.apikey);
    const clientInfo = await this.userService.getInfoByMobile(authInfo.mobile);

    await this.authClientService
      .submit(reqInfo.user, reqInfo.auth, toggleBoolean(getInfo.wallet), getInfo.maxbuy, true)
      .then((res) => {
        console.log(res, 'resss');
      });

    console.log(userInfo, 'userInfo');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`
    <form action="${userInfo.callback}" method="post" id="account_sumit">
      <input type="hidden" name="fullname" value="${clientInfo.fullname}" />
      <input type="hidden" name="birthdate" value="${clientInfo.birthdate}" />
      <input type="hidden" name="accid" value"${clientInfo.account_no}" />
      <input type="hidden" name="mobile" value="${clientInfo.mobile}" />
      <input type="hidden" name="payment" value="${toggleBoolean(getInfo.wallet)}" />
      <input type="hidden" name="maxpayment" value="${getInfo.maxbuy}" />
    </form>
    <script type="text/javascript">
    var f=document.getElementById('account_sumit');
    f.submit();
    </script>
    `);
    res.end();
  }

  async getActionPlay(token: string, req: Request, res: Response): Promise<any> {
    const reqInfo = await this.authRequestService.getToken(token);
    if (!reqInfo) {
      res.redirect(301, 'https://account.rialpayment.ir/auth/error');
    }
    const uuid = uniqid();
    res.redirect(301, 'https://account.rialpayment.ir/?token=' + token + '&session=' + uuid);
  }
}
