import {
  Controller,
  Get,
  Req,
  Post,
  Body,
  successOptWithPagination,
  successOpt,
  faildOpt,
  NotFoundException,
} from '@vision/common';
import { AuthService } from '../auth.service';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { GeneralService } from '../../../Core/service/general.service';
import { loginAuthDto } from '../dto/loginAuth.dto';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { AclCoreService } from '../../../Core/acl/acl.service';
import { UserApiService } from '../userapi.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { LoggedinService } from '../loggedin.service';
import { Roles } from '../../../Guard/roles.decorations';
import { AccountBlockService } from '../../../Core/useraccount/account/services/account-block.service';
import { BasketStoreCoreService } from '../../../Core/basket/store/basket-store.service';
import { MipgCoreService } from '../../../Core/mipg/mipg.service';
import { MerchantCoreTerminalBalanceService } from '../../../Core/merchant/services/merchant-terminal-balance.service';

@Controller('login')
export class LoginController {
  constructor(
    private readonly accountService: AccountService,
    private readonly generalService: GeneralService,
    private readonly aclService: AclCoreService,
    private readonly authService: AuthService,
    private readonly accountBlockedService: AccountBlockService,
    private readonly userApiService: UserApiService,
    private readonly loggedinService: LoggedinService,
    private readonly basketStoreService: BasketStoreCoreService,
    private readonly mipgService: MipgCoreService,
    private readonly merchantTerminalsService: MerchantCoreTerminalBalanceService
  ) {}

  @Post('')
  async login(@Body() loginAuthDto: loginAuthDto, @Req() req): Promise<any> {
    return this.userApiService.loginState(loginAuthDto, req.ip, req);
  }

  @Post('getloggedin')
  async getLoggedIn(@Body() getInfo, @Req() req): Promise<any> {
    const refid = await this.generalService.getUserid(req);
    if (isEmpty(getInfo.userid)) throw new FillFieldsException();
    const userid = getInfo.userid;
    return this.loggedinService.getLoggedin(userid, refid, req);
  }

  @Get('accounts')
  async getAccounts(@Req() req): Promise<any> {
    const shop = req.headers.shop ?? '';
    let shopCredit = 0;

    const userid = await this.generalService.getUserid(req);
    if (shop !== '') {
      const shopData = await this.basketStoreService.getInfoByNickname(shop as string);
      if (!shopData) throw new NotFoundException('فروشگاه مورد نظر یافت نشد');
      if (!!shopData.mipg) {
        const mipg = await this.mipgService.getInfoById(shopData.mipg);
        if (!!mipg) {
          const amounts = await this.merchantTerminalsService.getBalanceInTerminalsStore([mipg.terminal], userid);
          shopCredit = amounts && amounts.length > 0 ? amounts[0].amount : 0;
        }
      }
    }
    const accounts = await this.accountService.getAccounts(userid);
    if (!accounts) throw new UserNotfoundException();
    const credit = await this.authService.getCreditBalance(userid);
    const todayCharge = await this.accountService.getTodayCharge(userid);
    const blocked = await this.accountBlockedService.getBlock(userid);
    let blockedAmount = 0;
    if (blocked.length > 0) {
      blockedAmount = blocked[0].total;
    }
    let todayAmount = 0;
    if (!isEmpty(todayCharge)) todayAmount = todayCharge[0].total;
    return AuthService.getAccounts(accounts, todayAmount, blockedAmount, credit, shopCredit);
  }

  @Get('accounts/block')
  async getBlockedAmount(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    const data = await this.accountBlockedService.getList(userid, page);
    return successOptWithPagination(data);
  }

  @Get('getInformation')
  async getInformation(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.userApiService.getInformtion(userid);
  }
  @Post('getInformation')
  async postInformation(@Body() getInfo, @Req() req): Promise<any> {
    // const userid = await this.generalService.getUserid( req );
    return this.userApiService.getInformtion(getInfo.id);
  }

  @Get('permission')
  async getPermission(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.aclService.getUser(userid);
  }

  @Get('subset')
  @Roles('customerclub', 'agent')
  async subset(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return this.userApiService.getSubSetList(userid, page);
  }

  @Post('subset')
  @Roles('customerclub', 'agent')
  async searchSubset(@Body() search: string, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);
    return this.userApiService.searchByRefUsers(userid, page, search.search);
  }
}
