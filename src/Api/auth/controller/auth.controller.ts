import {
  Controller,
  Get,
  Res,
  Post,
  Body,
  Req,
  faildOpt,
  successOpt,
  successOptWithDataNoValidation,
  Query,
} from '@vision/common';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { AuthService } from '../auth.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { GeneralService } from '../../../Core/service/general.service';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { NewUserAuthhDto } from '../dto/newuser.dto';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { Roles } from '../../../Guard/roles.decorations';
import { RegisterUserService } from '../../../Core/useraccount/register/resgiter-user.service';
import { Messages } from '@vision/common/constants/messages.const';
import { OPeratorCoreService } from '../../../Core/useraccount/operator/operator.service';
import { AuthClubDataService } from '../auth-club-data.service';
import { TokenService } from '../../../Core/useraccount/token/token.service';

@Controller('auth')
export class AuthController {
  private bulk = Array();
  constructor(
    private readonly generalService: GeneralService,
    private readonly userService: UserService,
    private readonly registerService: RegisterUserService,
    private readonly operatorService: OPeratorCoreService,
    private readonly authClubDataService: AuthClubDataService,
    private readonly tokenService: TokenService
  ) {}

  @Post()
  async create(@Body() createAuthDto: CreateAuthDto) {
    const data = await this.registerService.registerUser(createAuthDto);
    if (!data) return faildOpt();
    return successOpt();
  }

  @Post('new')
  @Roles('agent', 'customerclub')
  async newUser(@Body() createAuthDto: NewUserAuthhDto, @Req() req) {
    const userid = await this.generalService.getUserid(req);
    const role = await this.generalService.getRole(req);
    const data = await this.registerService.registerFromUser(createAuthDto, userid, role);
    if (!data) return faildOpt();
    return successOptWithDataNoValidation(data);
  }

  @Post('checkuser')
  async checkUser(@Body() getInfo): Promise<any> {
    if (isEmpty(getInfo.nationalcode)) throw new FillFieldsException();
    const users = await this.userService.checkUserByNationalCode(getInfo.nationalcode);
    if (!users) throw new UserNotfoundException();
    return AuthService.transformSuccessWithData(users);
  }

  // @Depreacted for mobile transfer
  @Post('checkmobile')
  async checkmobile(@Body() getInfo): Promise<any> {
    if (isEmpty(getInfo.mobile)) throw new FillFieldsException();
    return await this.userService.findByMobileUser(getInfo.mobile);
  }

  @Post('checkpayid')
  async checkpayid(@Body() getInfo): Promise<any> {
    if (isEmpty(getInfo.payid)) throw new FillFieldsException();
    return await this.userService.findByPayid(getInfo.payid);
  }

  @Post('registerphone')
  async registerPhone(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    if (!userid) throw new FillFieldsException();
    return await this.userService.insertregphone(getInfo.regid, userid);
  }

  @Get('getclublogo')
  async getClubLogo(@Query('name') clubSubdomain: string): Promise<any> {
    return this.authClubDataService.getClubLogoByReferer(clubSubdomain);
  }

  @Get('getclubqrdata')
  async getClubQrData(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.authClubDataService.getClubQrData(userid);
  }

  @Get('getacc')
  async getAccountNo(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    const data = await this.userService.getAccountNo(userid);
    if (!data) throw new UserNotfoundException();
    return {
      status: 200,
      success: true,
      message: Messages.success.opt,
      accountNum: data.account_no,
    };
  }

  @Post('groupregister')
  @Roles('agent', 'customerclub')
  async registerGroup(@Body() getInfo, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.registerService.registerBulk(req, userid, getInfo.group);
  }

  @Post('pos/operator')
  async newPosOperator(@Body() getInfo): Promise<any> {
    return this.operatorService.addNew(getInfo);
  }

  @Post('regopt')
  async regopt2(): Promise<any> {
    const mobile = new Date().getDate();

    return this.registerService.registerOperator(
      mobile,
      mobile,
      'باشگاه مشتریانتست',
      '5c5583c504adbb334bd9c317',
      mobile,
      'operator'
    );
  }

  @Get('logout')
  async logoutUser(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);

    const token = req.header('Authorization').split(' ');
    const data = await this.tokenService.disableByToken(token[1], userid);
    if (data) return successOpt();

    return faildOpt();
  }
}
