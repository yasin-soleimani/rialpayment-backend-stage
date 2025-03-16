import { Injectable, InternalServerErrorException, successOpt } from '@vision/common';
import { RegisterUserCoreDto } from '../dto/register-user.dto';
import { UserService } from '../../user/user.service';
// import { digitsFaToEn } from 'persian-tools';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { GeneralService } from '../../../service/general.service';
import { RegisterCommonInService } from './register-common.service';
import { RegisterFromUserDto } from '../dto/register-from-user.dto';
import { CardmanagementcoreService } from '../../../cardmanagement/cardmanagementcore.service';
import { GroupCoreService } from '../../../group/group.service';
import { NationalCoreService } from '../../../national/services/national.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import * as moment from 'jalali-moment';
import { ClubCoreService } from '../../../../Core/customerclub/club.service';

@Injectable()
export class RegisterUserInService {
  constructor(
    private readonly nationalService: NationalCoreService,
    private readonly generalService: GeneralService,
    private readonly commonService: RegisterCommonInService,
    private readonly cardManagementService: CardmanagementcoreService,
    private readonly groupService: GroupCoreService,
    private readonly clubService: ClubCoreService,
    private readonly userService: UserService
  ) {}

  async regUser(getInfo: RegisterUserCoreDto): Promise<any> {
    // Check all request body
    await this.commonService.checkFields(getInfo);
    // getInfo.mobile = digitsFaToEn(getInfo.mobile);
    // getInfo.nationalcode = digitsFaToEn(getInfo.nationalcode);

    if (!isEmpty(getInfo.refid)) {
      const refInfo = await this.userService.getInfoByRefid(getInfo.refid.toUpperCase());
      if (refInfo) {
        getInfo.ref = refInfo._id;
      }
    }

    const data = await this.commonService.register(getInfo);

    const msgBody = 'کد فعال سازی شما ' + data.acode;
    this.generalService.AsanaksendSMS(
      process.env.ASANAK_USERNAME,
      process.env.ASANAK_PASSWORD,
      process.env.ASANAK_NUMBER,
      getInfo.mobile.toString(),
      msgBody
    );

    return data;
  }

  async authUser(nationalcode: string, birthdate: number, userid: string, type: number): Promise<any> {
    if (type == 2) return this.nationalAuth(nationalcode, userid);
    const userInfo = await this.commonService.reqSitad(nationalcode, birthdate);
    const fullname = userInfo.name + ' ' + userInfo.family;
    const place = userInfo.officeName;
    const regInfo = await this.userService.authUser(userid, nationalcode, birthdate, fullname, place);
    if (!regInfo) throw new InternalServerErrorException();
    return successOpt();
  }

  async nationalAuth(idcode, userid): Promise<any> {
    const userInfo = await this.nationalService.getInfoByIdCode(idcode);

    if (!userInfo) throw new UserCustomException('متاسفانه اطلاعات شما معتبر نمی باشد', false, 201);
    const fullname = userInfo.firstname + ' ' + userInfo.lastname;
    const place = userInfo.place;
    const birthdate = moment(userInfo.birthdate).locale('fa').format('YYYYMMDD');
    const regInfo = await this.userService.authUser(userid, userInfo.idcode, Number(birthdate), fullname, place);
    if (!regInfo) throw new InternalServerErrorException();
    return successOpt();
  }

  async newMethod(mobile, password, ref): Promise<any> {
    const userInfo = await this.commonService.newMethod(mobile, password, ref);

    const msgBody = 'کد فعال سازی شما ' + userInfo.acode;
    this.generalService.AsanaksendSMS(
      process.env.ASANAK_USERNAME,
      process.env.ASANAK_PASSWORD,
      process.env.ASANAK_NUMBER,
      '0' + userInfo.mobile,
      msgBody
    );

    return successOpt();
  }

  async registerFromPos(mobile, password, ref): Promise<any> {
    const userInfo = await this.commonService.newMethod(mobile, password, ref);

    const msgBody = 'کاربر گرامی، ثبت نام شما با موفقیت انجام شد.\n :کد فعال سازی شما ' + userInfo.acode;

    this.generalService.AsanaksendSMS(
      process.env.ASANAK_USERNAME,
      process.env.ASANAK_PASSWORD,
      process.env.ASANAK_NUMBER,
      '0' + userInfo.mobile,
      msgBody
    );

    return userInfo;
  }

  async registerFromUser(getInfo: RegisterFromUserDto, refid, role: string): Promise<any> {
    getInfo.password = '0' + getInfo.mobile.toString();
    // Check all request body
    // await this.commonService.checkFields2( getInfo );
    // getInfo.mobile = digitsFaToEn(getInfo.mobile);
    // getInfo.nationalcode = digitsFaToEn(getInfo.nationalcode);

    const data = await this.commonService.register(getInfo, refid, role);
    if (!isEmpty(getInfo.group)) {
      this.groupService.addUserToGroup(data._id, getInfo.group);
    }

    if (!isEmpty(getInfo.cardno)) {
      this.cardManagementService.insertCardWithNewRegister(data._id, getInfo.cardno, '');
    }

    return data;
  }

  async BulkRegister(req, userid, group): Promise<any> {
    return this.commonService.readXlsx(req, userid, group);
  }
}
