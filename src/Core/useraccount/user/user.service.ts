import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  successOpt,
} from '@vision/common';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { invalidUserPassException } from '@vision/common/exceptions/invalid-userpass.exception';
import { loginAuthDto } from '../../../Api/auth/dto/loginAuth.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import * as bcrypt from 'bcrypt';
import * as securePin from 'secure-pin';
import { AuthService } from '../../../Api/auth/auth.service';
import { ActivateDto } from '../../../Api/auth/dto/activate.dto';
import { GeneralService } from '../../service/general.service';
import { ProfileDto, ProfileLinkSettingsDto } from '../../../Api/profile/dto/profile.dto';
// import { digitsFaToEn } from 'persian-tools';
import { CompleteUserCoreDto } from './dto/complete-user.dto';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { LegalcoreDto } from './dto/legal.dto';
import { imageTransform } from '@vision/common/transform/image.transform';
import { generateRandomChar } from '@vision/common/services/generate-random-char.service';
import { primeNumberToken } from '@vision/common/services/tokenizer.service';
import { PaymentTypesEnum } from '@vision/common/enums/payment-types.enum';
import { Types } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '../../../Api/auth/interfaces/jwt-payload.interface';
import { AclCoreService } from '../../acl/acl.service';
import { TerminalType } from '@vision/common/enums/terminalType.enum';
import { CardcounterService } from '../cardcounter/cardcounter.service';
import { diffDays } from '@vision/common/utils/month-diff.util';
import { TokenCoreCommonService } from '../token/services/common.service';
import { getIp } from '../../../Guard/ip.decoration';
import { TokenService } from '../token/token.service';
import { ClubCoreService } from '../../customerclub/club.service';
const Hashids = require('hashids/cjs');

@Injectable()
export class UserService {
  constructor(
    @Inject('UserModel') private readonly userModel: any,
    private readonly counterService: CardcounterService,
    private readonly generalService: GeneralService,
    private readonly aclService: AclCoreService,
    private readonly tokenService: TokenService
  ) {}

  async validateUser(payload): Promise<User | boolean> {
    if (!payload.hasOwnProperty('_id')) return false;
    return await this.userModel.findById(payload._id);
  }

  async regOperator(mobile, password, fullname, ref, nationalcode, type): Promise<any> {
    const user = await this.userModel.create({
      mobile: mobile,
      fullname: fullname,
      password: password,
      ref: ref,
      nationalcode: nationalcode,
      type: type,
      active: true,
    });

    return user;
  }

  async setUserSmsStatus(userid: string, status: boolean): Promise<any> {
    return this.userModel.findOneAndUpdate(
      {
        _id: userid,
      },
      {
        sms: status,
      }
    );
  }

  async findOperator(userid, mobile): Promise<any> {
    return this.userModel
      .find({
        mobile: mobile,
        ref: userid,
        type: 'operator',
      })
      .select({ mobile: 1, fullname: 1, _id: 1 });
  }

  async findByRef(ref): Promise<any> {
    return this.userModel.findOne({ refid: ref });
  }

  async authUser(
    userid: string,
    nationalcode: string,
    birthdate: number,
    fullname: string,
    place: string
  ): Promise<any> {
    return this.userModel.findOneAndUpdate(
      { _id: userid },
      {
        nationalcode: nationalcode,
        birthdate: birthdate,
        fullname: fullname,
        place: place,
      }
    );
  }

  async getInfoByMobile(mobile: number): Promise<any> {
    return this.userModel.findOne({ mobile: mobile });
  }

  async getUndefined(): Promise<any> {
    return this.userModel.find({ fullname: 'undefined undefined' });
  }

  async unsetAuth(userid: string): Promise<any> {
    return this.userModel.findOneAndUpdate(
      { _id: userid },
      { $unset: { fullname: '', nationalcode: '', birthdate: '' } }
    );
  }

  async getInfoByAccountNo(accountNo: number): Promise<any> {
    return await this.userModel
      .findOne({ account_no: accountNo })
      .populate('accounts')
      .populate({ path: 'card', select: { cardno: 1, _id: 0, user: 0 } })
      .populate('merchant')
      .exec();
  }

  async getInfoByUserid(userid: string): Promise<any> {
    return this.userModel
      .findOne({ _id: userid })
      .populate('card')
      .populate({ path: 'usergroup', populate: { path: 'group' } })
      .exec();
  }

  async changeMaxCashout(userid: string, amount: number): Promise<any> {
    return this.userModel.findOneAndUpdate(
      {
        _id: userid,
      },
      {
        maxcheckout: amount,
      }
    );
  }
  async changeCashout(userid: string, amount: number, perday: number, perhour: number): Promise<any> {
    return this.userModel.findOneAndUpdate(
      {
        _id: userid,
      },
      {
        maxcheckout: amount,
        perhour: perhour,
        perday: perday,
      }
    );
  }
  async getAllInfoByUserid(userid: string): Promise<any> {
    return this.userModel
      .findOne({ _id: userid })
      .populate('card')
      .populate('usergroup')
      .populate('accounts')
      .populate('acl')
      .populate('shetab')
      .populate('ref')
      .populate('history');
  }
  async getAccountNo(userid): Promise<any> {
    return this.userModel.findOne({ _id: userid });
  }

  async getdata(nationalcodex, mobilex): Promise<any> {
    const query = { $or: [{ nationalcode: nationalcodex }, { mobile: mobilex }] };
    return await this.userModel.findOne(query).populate('accounts').populate('card');
  }

  async changeBlockSatusById(userid, status): Promise<any> {
    return this.userModel.findOneAndUpdate({ _id: userid }, { block: status });
  }
  async changeCheckoutSatus(mobile, status): Promise<any> {
    return this.userModel.findOneAndUpdate({ mobile: mobile }, { checkout: status });
  }
  async getUsersByRef(userid: string, page): Promise<any> {
    return this.userModel.paginate(
      { ref: userid, type: 'user' },
      {
        populate: { path: 'usergroup', populate: { path: 'group' } },
        select: 'fullname mobile nationalcode active account_no avatar',
        page,
        lean: false,
        sort: { createdAt: -1 },
        limit: 50,
      }
    );
  }

  async findById(userid): Promise<any> {
    return this.userModel.findOne({ _id: userid });
  }

  async getInfoByRefid(refid): Promise<any> {
    return this.userModel.findOne({ refid: refid });
  }

  async newMethodRegister(mobile, password, refid): Promise<any> {
    return this.userModel.create({ mobile: mobile, password: password, ref: refid, checkout: false });
  }

  async insertregphone(regid, userid): Promise<any> {
    const data = await this.userModel.findByIdAndUpdate(userid, { $set: { fcm: regid } });
    if (!data) throw new UserCustomException('متاسفانه خطایی در ثبت رخ داده است', false, 500);
    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
    };
  }

  async searchUsersByRef(userid, page, search): Promise<any> {
    const where = '/^' + search + '/.test(this.mobile)';

    const query = {
      $and: [
        { ref: userid },
        { type: 'user' },
        {
          $or: [{ nationalcode: search }, { mobile: search }],
        },
      ],
    };
    return this.userModel.paginate(query, {
      populate: { path: 'usergroup', populate: { path: 'group' } },
      select: 'fullname mobile nationalcode active account_no avatar',
      page,
      lean: false,
      sort: { createdAt: -1 },
      limit: 50,
    });
  }

  async create(createAuthDto: CreateUserDto): Promise<any> {
    return await this.userModel.create(createAuthDto);
  }

  async createWithParams(
    mobile,
    nationalcode,
    birthdate,
    password,
    profilestatus,
    userid?,
    active?,
    account_no?
  ): Promise<any> {
    const registerData = {
      mobile: mobile,
      nationalcode: nationalcode,
      birthdate: birthdate,
      password: password,
      active: active,
      profilestatus: profilestatus,
      ref: userid,
    };
    return await this.userModel.create(registerData);
  }

  async findAll(): Promise<any> {
    return await this.userModel
      .findOne()
      .populate({ path: 'card', select: { cardno: 1, _id: 0, user: 0 } })
      .populate({ path: 'accounts', select: { _id: 0, currency: 1, type: 1, balance: 1 } })
      .exec();
  }

  async bulkInsert(bulkData): Promise<any> {
    return this.userModel.insertMany(bulkData, { ordered: false });
  }

  async findUser(userid: string): Promise<any> {
    return await this.userModel
      .findById(userid)
      .populate({ path: 'card', select: { cardno: 1, _id: 0, user: 0 } })
      .populate({ path: 'accounts' })
      .exec();
  }

  async findUserSignle(userid): Promise<any> {
    return this.userModel.findById(userid);
  }
  async findUserAll(userid: string): Promise<any> {
    return await this.userModel.findById(userid).populate('accounts').exec();
  }
  async findAndUpdate(userid: string, accountno: number) {
    return await this.userModel.findByIdAndUpdate(userid, { account_no: accountno }).exec();
  }

  async findCopletemAndUpdate(userid: string, getInfo: CompleteUserCoreDto): Promise<any> {
    return await this.userModel.findByIdAndUpdate(userid, { complete: getInfo }).exec();
  }

  async findAndUpdateAvatar(userid: string, avatarx: string) {
    return await this.userModel.findByIdAndUpdate(userid, { avatar: avatarx }).exec();
  }
  async findByMobile(mobilex: number): Promise<any> {
    return await this.userModel
      .findOne({ mobile: mobilex })
      .populate({ path: 'card', select: { cardno: 1, _id: 0, user: 0 } })
      .populate({
        path: 'terminal',
        match: { type: TerminalType.Mobile },
        populate: [{ path: 'strategy' }, { path: 'merchant' }],
      })
      .populate({ path: 'acl' })
      .populate({ path: 'accounts' })
      .exec();
  }

  async findByUseridAll(userid: string): Promise<any> {
    return this.userModel
      .findOne({ _id: userid })
      .populate({ path: 'card', select: { cardno: 1, _id: 0, user: 0 } })
      .populate({
        path: 'terminal',
        match: { type: PaymentTypesEnum.Mobile },
        populate: [{ path: 'strategy' }, { path: 'merchant' }],
      })
      .populate({ path: 'accounts' })
      .exec();
  }

  async findByNid(nid): Promise<any> {
    return await this.userModel
      .findOne({ nationalcode: nid })
      .select({ password: 0 })
      .populate({ path: 'card', select: { cardno: 1, _id: 1, user: 0 } })
      .populate({ path: 'accounts', select: { balance: 1, type: 1, currency: 1, _id: 0, user: 0 } })
      .populate('ref')
      .populate({ path: 'usergroup', populate: { path: 'group' } })
      .exec();
  }

  async findAndUpdateProfile(userid: string, profileDto: ProfileDto): Promise<any> {
    return await this.userModel.findByIdAndUpdate(userid, profileDto).exec();
  }

  async findAndUpdateProfileLinkSettings(userid: string, linkSettingsDto: ProfileLinkSettingsDto): Promise<any> {
    return await this.userModel.findByIdAndUpdate(userid, linkSettingsDto).exec();
  }

  async changeMobile(userid, mobile): Promise<any> {
    return await this.userModel.findOneAndUpdate({ _id: userid }, { mobile: mobile, active: false });
  }

  async changeBirthdate(userid, birthdate, fullname, place): Promise<any> {
    return await this.userModel.findOneAndUpdate(
      { _id: userid },
      { fullname: fullname, place: place, birthdate: birthdate }
    );
  }

  async findByPayid(payidx): Promise<any> {
    const user = await this.userModel.findOne({ account_no: payidx });
    if (user) {
      let tellphone = false;
      if (user.showMyTellToOthers) {
        tellphone = user.tell;
      }
      let emailShow = false;
      if (user.showMyEmailToOthers) {
        emailShow = user.email;
      }

      let fullname;
      if (user.islegal) {
        fullname = user.legal.title + ' ' + user.legal.name;
      } else {
        fullname = user.fullname;
      }
      return {
        status: 200,
        success: true,
        message: 'عملیات با موفقیت انجام شد',
        data: {
          fullname: fullname || 'بی نام',
          account_no: user.account_no,
          islegal: user.islegal || false,
          avatar: process.env.SITE_URL + user.avatar,
          tell: tellphone,
          email: emailShow,
          aboutme: user.aboutme,
          website: user.website,
        },
      };
    } else {
      return {
        status: 404,
        success: false,
        message: 'کاربر یافت نشد',
      };
    }
  }

  async getAllUsersInDB(): Promise<any> {
    return await this.userModel.find({}).then((value) => {
      console.log(value);
    });
  }
  async findByMobileUser(mobilex): Promise<any> {
    const user = await this.userModel.findOne({ mobile: mobilex });
    if (user) {
      return {
        status: 200,
        success: true,
        message: 'عملیات با موفقیت انجام شد',
        fullname: user.fullname || 'بی نام',
        avatar: imageTransform(user.avatar),
        accountNo: user.account_no,
        userid: user._id,
      };
    } else {
      return {
        status: 404,
        success: false,
        message: 'کاربر یافت نشد',
      };
    }
  }

  async findByIdAndUpdateActive(userid: string): Promise<any> {
    return await this.userModel.findByIdAndUpdate(userid, { active: true, acode: null }).exec();
  }

  async findByIdAndUpdateCode(userid: string, code: string): Promise<any> {
    return await this.userModel.findByIdAndUpdate(userid, { acode: code }).exec();
  }

  async findByIdAndSetCode(userid: string, code: string): Promise<any> {
    return this.userModel.findOneAndUpdate({ _id: userid }, { acode: code });
  }

  async findByIdAndUpdatePassword(userid: string, passwordx: string): Promise<any> {
    return await this.userModel.findByIdAndUpdate(userid, { password: passwordx }).exec();
  }
  async checkLogin(loginDto: loginAuthDto, req): Promise<any> {
    // loginDto.mobile = digitsFaToEn(loginDto.mobile);
    this.checkLoginFields(loginDto);
    const user = await this.findByMobile(loginDto.mobile);
    if (!user) throw new UserNotfoundException();
    if (user.access === false) throw new UserCustomException('متاسفانه دسترسی شما به سامانه مسدود شده است');
    if (user.active) {
      let staticamount = false;
      if (user.terminal) staticamount = true;
      const valid = await this.compareHash(loginDto.password, user.password);
      if (!valid) throw new invalidUserPassException();

      const userRequest = getIp(req);
      const token = await this.createToken(user._id, userRequest.userAgent, userRequest.ip);
      const myToken = await this.payTokenizer(user._id, loginDto.devicetype, loginDto.deviceinfo);
      let remainday;
      if (user.acl) {
        const remainDays = diffDays(user.acl.createdAt, user.acl.expire);
        remainday = remainDays;
      }
      if (remainday < 1) {
        remainday = 0;
      }
      return {
        user: user,
        token: token,
        myToken: myToken,
        staticamount: staticamount,
        remainday: remainday,
      };
      // return AuthService.loginSuccess( user, token, myToken, staticamount );
    } else {
      throw new UserCustomException('حساب کاربری غیرفعال می باشد', false, 304);
    }
  }

  private async payTokenizer(user, devicetype, mac): Promise<any> {
    let myToken;
    if (devicetype === 'mobile' || devicetype === 'mobile_google' || devicetype === 'pwa') {
      const hek = generateRandomChar(10);
      console.log(mac, hek);
      this.userModel.findByIdAndUpdate(user._id, { $set: { hek: hek, hmac: mac } }).then((value) => {});

      const uek = primeNumberToken(user._id);

      myToken = uek + hek;
    }
    return myToken;
  }

  async getProfile(userid): Promise<any> {
    const profile = await this.findUser(userid);
    return UserService.getProfileSuccess(profile);
  }

  static getProfileSuccess(info: any) {
    console.log(info, 'info');
    return {
      success: true,
      status: 200,
      message: 'عملیات با موفقیت انجام شد',
      mobile: info.mobile,
      address: info.address || '',
      sms: info.sms,
      zipcode: info.zipcode || '',
      ref: info.ref || '',
      islegal: info.islegal || false,
      title: info.legal.title,
      name: info.legal.name,
      nationalcode: info.nationalcode || '',
      birthdate: info.birthdate || '',
      city: info.city || '',
      tell: info.tell || '',
      fullname: info.fullname || '',
      email: info.email || '',
      showMyEmailToOthers: info.showMyEmailToOthers || false,
      account_no: info.account_no,
      showMyTellToOthers: info.showMyTellToOthers || false,
      showMyIranianShopLink: info?.showMyIranianShopLink || false,
      showMyOwnShopLink: info?.showMyOwnShopLink || false,
      showMyTransferLink: info?.showMyTransferLink || false,
      state: info.state || '',
      place: info.place || '',
      organ: info.complete.organ || '',
      senf: info.complete.senf || '',
      aboutme: info.aboutme || '',
      mywebsite: info.mywebsite || '',
    };
  }

  async activateUser(activateDto: ActivateDto): Promise<any> {
    if (isEmpty(activateDto.acode) || isEmpty(activateDto.mobile)) throw new FillFieldsException();
    const user = await this.findByMobile(activateDto.mobile);
    if (!user) throw new UserNotfoundException();
    if (activateDto.acode === user.acode) {
      await this.findByIdAndUpdateActive(user._id);
      return AuthService.avtivated();
    } else {
      return AuthService.invalidavtivation();
    }
  }

  async resendActivation(activateDto: ActivateDto): Promise<any> {
    if (isEmpty(activateDto.mobile)) throw new FillFieldsException();
    const user = await this.findByMobile(activateDto.mobile);
    if (!user) throw new UserNotfoundException();
    if (user.active == false) {
      const msgBody = 'کد فعال سازی شما ' + user.acode + ' \n' + 'Pvcd+KV33Zt';
      this.generalService.AsanaksendSMS(
        process.env.ASANAK_USERNAME,
        process.env.ASANAK_PASSWORD,
        process.env.ASANAK_NUMBER,
        activateDto.mobile.toString(),
        msgBody
      );
      return AuthService.successOpt();
    } else {
      return AuthService.isActive();
    }
  }

  async getForgetcode(activateDto: ActivateDto): Promise<any> {
    if (isEmpty(activateDto.mobile)) throw new FillFieldsException();
    // if (persianize.validator().mobile(activateDto.mobile))
    //   throw new UserCustomException('شماره موبایل صحیح نمی باشد ');
    const user = await this.findByMobile(activateDto.mobile);
    if (!user) throw new UserNotfoundException();

    const randno = securePin.generatePinSync(4);
    const msgBody = 'کد تغییر کلمه عبور شما ' + randno + ' \n' + 'Pvcd+KV33Zt';

    const forget = await this.findByIdAndUpdateCode(user._id, randno);
    if (!forget) throw new BadRequestException('متاسفانه عملیات با مشکل مواجه شد مجددا تلاش کنید');
    this.generalService.AsanaksendSMS(
      process.env.ASANAK_USERNAME,
      process.env.ASANAK_PASSWORD,
      process.env.ASANAK_NUMBER,
      activateDto.mobile.toString(),
      msgBody
    );
    return AuthService.successOpt();
  }

  async verifyForgetCode(activateDto: ActivateDto): Promise<any> {
    if (isEmpty(activateDto.mobile) || isEmpty(activateDto.acode)) throw new FillFieldsException();
    const user = await this.findByMobile(activateDto.mobile);
    if (!user) throw new UserNotfoundException();
    if (activateDto.acode == user.acode) {
      return AuthService.validCode();
    } else {
      return AuthService.invalidCode();
    }
  }

  async newPassword(activateDto: ActivateDto): Promise<any> {
    if (isEmpty(activateDto.mobile) || isEmpty(activateDto.acode) || isEmpty(activateDto.password))
      throw new FillFieldsException();
    const user = await this.findByMobile(activateDto.mobile);
    if (!user) throw new UserNotfoundException();
    if (activateDto.acode == user.acode && activateDto.mobile == user.mobile) {
      const salt = bcrypt.genSaltSync(15);
      const newpassword = bcrypt.hashSync(activateDto.password, salt);
      this.findByIdAndUpdatePassword(user._id, newpassword);
      this.tokenService.terminateAll(user._id, null);
      return AuthService.successOpt();
    } else {
      return AuthService.invalidCode();
    }
  }

  async updateProfile(userid: string, profileDto: ProfileDto): Promise<any> {
    if (
      isEmpty(profileDto.address) ||
      isEmpty(profileDto.city) ||
      isEmpty(profileDto.state) ||
      isEmpty(profileDto.tell) ||
      isEmpty(profileDto.zipcode)
    )
      throw new FillFieldsException();
    const userInfo = await this.userModel.findOne({ _id: userid });
    if (userInfo.type == 'customerclub') delete profileDto.birthdate;
    if (!isEmpty(profileDto.islegal) && profileDto.islegal.toString() === 'true') {
      const legaldata = this.setlegal(profileDto);
      await this.completeLegal(legaldata, userid);
    } else {
      await this.userModel.findOneAndUpdate({ _id: userid }, { islegal: false });
    }
    const user = await this.findAndUpdateProfile(userid, profileDto);
    if (!user) throw new UserNotfoundException();
    return AuthService.successOpt();
  }

  async updateProfileLinkSettings(userid: string, linkSettingsDto: ProfileLinkSettingsDto): Promise<any> {
    if (
      !linkSettingsDto?.showMyIranianShopLink &&
      !linkSettingsDto?.showMyOwnShopLink &&
      !linkSettingsDto?.showMyTransferLink
    ) {
      throw new InternalServerErrorException('حداقل یکی از موارد باید انتخاب شود');
    }

    const user = await this.findAndUpdateProfileLinkSettings(userid, linkSettingsDto);
    if (!user) throw new UserNotfoundException();
    return AuthService.successOpt();
  }

  async test(): Promise<any> {}

  async completeUpdate(userid: string, getInfo: CompleteUserCoreDto): Promise<any> {
    if (isEmpty(getInfo.organ) || isEmpty(getInfo.sazman) || isEmpty(getInfo.senf)) throw new FillFieldsException();
    const complete = await this.findCopletemAndUpdate(userid, getInfo);
    if (!complete) throw new InternalServerErrorException();
    return AuthService.successOpt();
  }

  async isAgent(userid: string): Promise<any> {
    let ObjID = Types.ObjectId;
    return this.userModel.aggregate([
      {
        $lookup: {
          from: 'acls',
          localField: '_id',
          foreignField: 'user',
          as: 'agents',
        },
      },
      {
        $match: {
          'agents.user': ObjID(userid),
        },
      },
      {
        $addFields: {
          agent: { $arrayElemAt: ['$agents', 0] },
        },
      },
      {
        $project: {
          password: 0,
          agents: 0,
        },
      },
    ]);
  }

  async userAdminFilter(query, page): Promise<any> {
    // console.log( query );
    let aggregate = this.userModel.aggregate([
      {
        $lookup: {
          from: 'acls',
          localField: '_id',
          foreignField: 'user',
          as: 'acls',
        },
      },
      {
        $addFields: {
          acl: { $arrayElemAt: ['$acls', 0] },
          mob: {
            $toString: {
              $toLong: '$mobile',
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'ref',
          foreignField: '_id',
          as: 'ref',
        },
      },
      {
        $unwind: { path: '$ref', preserveNullAndEmptyArrays: true },
      },
      {
        $match: query,
      },
    ]);

    var options = { page: page, limit: 50 };
    return this.userModel.aggregatePaginate(aggregate, options);
  }

  async completeLegal(getInfo: LegalcoreDto, userid): Promise<any> {
    if (isEmpty(getInfo.name) || isEmpty(getInfo.title)) throw new FillFieldsException();
    // const userInfo = await this.userModel.findOne({ _id: userid });
    // if ( !userInfo.fullname ) throw new UserCustomException('ابتدا احراز هویت نمایید');
    const data = await this.userModel.findOneAndUpdate({ _id: userid }, { islegal: true, legal: getInfo });
    if (!data) throw new UserCustomException('متاسفانه عملیات با خطا مواجه شده است', false, 500);
    return AuthService.successOpt();
  }

  private checkLoginFields(loginDto: loginAuthDto) {
    if (isEmpty(loginDto.mobile) || isEmpty(loginDto.password) || isEmpty(loginDto.devicetype))
      throw new FillFieldsException();
  }

  async compareHash(password: string | undefined, hash: string | undefined): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private setlegal(info) {
    return {
      title: info.title,
      name: info.name,
    };
  }

  async checkUser(nationalcodex): Promise<any> {
    return this.userModel.findOne({ nationalcode: nationalcodex });
  }

  async checkUserByNationalCode(nationalcodex): Promise<any> {
    return this.userModel.find({ nationalcode: nationalcodex });
  }

  checkStatus(devicetype: string) {
    let status: number;
    switch (devicetype) {
      case 'mobile': {
        status = 12;
        break;
      }
      case 'mobile_google': {
        status = 12;
        break;
      }
      case 'web': {
        status = 11;
        break;
      }
    }
    return status;
  }

  async getLoggedIn(userid, refid): Promise<any> {
    const agentData = await this.isAgent(refid);
    if (isEmpty(agentData)) throw new UserCustomException('متاسفانه شما به کاربر دسترسی ندارید');
    const userData = await this.userModel
      .findOne({ _id: userid })
      .populate({ path: 'card', select: { cardno: 1, _id: 0, user: 0 } })
      .populate({ path: 'accounts' })
      .exec();
    if (!userData) throw new UserCustomException('متاسفانه شما به کاربر دسترسی ندارید');
    return userData;
  }

  async createToken(userid: string, userAgent: string, ip: string) {
    const data = await this.aclService.getAclUSer(userid);
    const userData = await this.getInfoByUserid(userid);
    console.log(
      'in create token:::::>>>>>>>>>>>>>>>>! ',
      userData,
      userData && userData.type && userData.type == 'admin'
    );

    // if (!data) throw new UserCustomException('برای کاربر دسترسی های لازم ایجاد نشده است');
    const acl = await this.aclService.aclTitlebar(data);
    // const user: JwtPayload = { id: userid, role: acl.type };
    const { token } = await this.tokenService.generate(
      userid,
      userAgent,
      ip,
      userData && userData.type && userData.type == 'admin' ? `${acl.type},admin` : acl.type
    );
    return {
      accessToken: token,
    };
  }

  async createAdminToken(userid: string, userAgent: string, ip: string) {
    const data = await this.aclService.getAclUSer(userid);

    const { token } = await this.tokenService.generate(userid, userAgent, ip, 'admin');
    return {
      accessToken: token,
    };
  }

  async makeRefID(userid): Promise<any> {
    const countInfo = await this.counterService.getUserRef();
    let hid = new Hashids('', 0, '0123456789ABCDEFGHIJKLMNOPQSRTUVWXYZ');
    const hashid = hid.encode(countInfo.refuser);
    return this.userModel.findOneAndUpdate({ _id: userid }, { refid: hashid });
  }

  async updateRef(): Promise<any> {
    let cc = 0;
    this.userModel.find({ refid: { $exists: false } }).then((res) => {
      console.log(res);
      for (let i = 0; res.length > i; i++) {
        this.makeRefID(res[i]._id).then((ok) => {
          cc++;
        });
      }
    });

    console.log(cc);
  }

  async changeRefID(userid, refid): Promise<any> {
    return this.userModel.findOneAndUpdate(
      {
        _id: userid,
      },
      {
        ref: refid,
      }
    );
  }

  async findByRefUser(ref): Promise<any> {
    return this.userModel.find({
      ref: ref,
    });
  }
  async blockUser(userid: string, block): Promise<any> {
    return this.userModel.findOneAndUpdate(
      {
        _id: userid,
      },
      {
        block: block,
      }
    );
  }

  async accessPanelUser(userid: string, access): Promise<any> {
    return this.userModel.findOneAndUpdate(
      {
        _id: userid,
      },
      {
        access: access,
      }
    );
  }
  async changeCheckout(userid, checkout): Promise<any> {
    return this.userModel.findOneAndUpdate(
      {
        _id: userid,
      },
      {
        checkout: checkout,
      }
    );
  }

  async getNotExistsAccount(): Promise<any> {
    return this.userModel.find({
      account_no: { $exists: false },
    });
  }

  async updateQuery(userid: string, query: any): Promise<any> {
    return this.userModel.findOneAndUpdate({ _id: userid }, query);
  }

  async getInfoByNationalCode(nationalcode: string): Promise<any> {
    return this.userModel.findOne({
      nationalcode: nationalcode,
    });
  }

  async getAggregate<T>(query: T[]): Promise<any> {
    return this.userModel.aggregate(query);
  }

  async getPaginateAggregate<T>(page: number, query: T): Promise<any> {
    let options = { page: page, limit: 50 };
    let aggregate = this.userModel.aggregate(query);
    return this.userModel.aggregatePaginate(aggregate, options);
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string, token: string): Promise<any> {
    if (newPassword.length < 8) throw new UserCustomException('کلمه عبور حداقل ۸ حرف می باشد');
    const userInfo = await this.getInfoByUserid(userId);
    if (!userInfo) throw new NotFoundException('کاربر یافت نشد');

    const passwordValidate = await this.compareHash(oldPassword, userInfo.password);
    if (!passwordValidate) throw new UserCustomException('کلمه عبور فعلی اشتباه می باشد ');

    const duplicateValidate = await this.compareHash(newPassword, userInfo.password);
    if (duplicateValidate) throw new UserCustomException('کلمه عبور تکراری می باشد');

    const salt = bcrypt.genSaltSync(15);
    const newpassword = bcrypt.hashSync(newPassword, salt);
    await this.findByIdAndUpdatePassword(userInfo._id, newpassword);
    this.tokenService.terminateAll(userId, token);
    return successOpt();
  }

  async updateUserFullname(userid: string, fullname: string): Promise<any> {
    return this.userModel.findOneAndUpdate(
      {
        _id: userid,
      },
      {
        fullname: fullname,
      }
    );
  }
}
