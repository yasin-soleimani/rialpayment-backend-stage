import {
  Injectable,
  Inject,
  loginSuccessOpt,
  InternalServerErrorException,
  showBalanceSuccessOpt,
  showUserDetails,
  successOpt,
} from '@vision/common';
import { AuthServiceDto } from './dto/authService.dto';
import { Sitad } from '@vision/common/utils/sitad.util';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import * as persianize from 'persianize';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { ApiPermCoreService } from '../../../Core/apiPerm/apiPerm.service';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { CardService } from '../../../Core/useraccount/card/card.service';
import { AuthServiceChangePwDto } from './dto/authServiceChangePw.dto';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import * as bcrypt from 'bcrypt';
import { invalidUserPassException } from '@vision/common/exceptions/invalid-userpass.exception';
import { CardmanagementcoreService } from '../../../Core/cardmanagement/cardmanagementcore.service';
import { CardManagementApiDto } from './dto/cardManagement.dto';

@Injectable()
export class AuthServiceService {
  constructor(
    private readonly apiPermService: ApiPermCoreService,
    private readonly userService: UserService,
    private readonly accountService: AccountService,
    private readonly cardService: CardService,
    private readonly cardManagementService: CardmanagementcoreService
  ) {}

  async newuser(getInfo: AuthServiceDto, username, password): Promise<any> {
    if (
      isEmpty(getInfo.nationalcode) ||
      isEmpty(getInfo.mobile) ||
      isEmpty(getInfo.password) ||
      isEmpty(getInfo.birthdate)
    )
      throw new FillFieldsException();

    const state = await this.checkState(username, password);
    if (!state) throw new UserCustomException('متاسفانه شما دسترسی ندارید', false, 401);
    const chkUser = await this.checkUser(getInfo.nationalcode, getInfo.mobile);
    if (chkUser) {
      const charge = await this.accountService.dechargeAccount(state.user, 'wallet', state.authamount);
      if (charge.balance < state.authamount)
        throw new UserCustomException('متاسفانه شارژ به اتمام رسیده است', false, 202);
      return this.transform(chkUser);
    } else {
      const sitadService = new Sitad();
      if (!persianize.validator().meliCode(getInfo.nationalcode))
        throw new UserCustomException('کد ملی را به صورت صحیح وارد نمایید');

      const dataUser = await sitadService.getInfo(getInfo.nationalcode, getInfo.birthdate);
      if (isEmpty(dataUser.name)) throw new UserCustomException('متاسفانه اطلاعات شما معتبر نمی باشد', false, 201);

      getInfo.fullname = dataUser.name + ' ' + dataUser.family;
      getInfo.place = dataUser.officeName;
      getInfo.profilestatus = 11;
      getInfo.active = true;
      getInfo.ref = state.user;

      const value = await this.userService.create(getInfo);

      if (!value) throw new UserCustomException('خطایی رخ داده است', false, 500);

      this.cardService.generateCard(value._id);
      this.accountService.makeWallet(value._id);
      this.accountService.makeCredit(value._id);
      this.accountService.makeDiscount(value._id);
      this.accountService.makeIdm(value._id);
      this.accountService.makeAccountID(value._id);

      await this.checkUser(getInfo.nationalcode, getInfo.mobile);
      const charge = await this.accountService.dechargeAccount(state.user, 'wallet', state.authamount);
      if (charge.balance < state.authamount)
        throw new UserCustomException('متاسفانه شارژ به اتمام رسیده است', false, 202);
      return this.transform(chkUser);
    }
  }

  async changepw(getInfo: AuthServiceChangePwDto, username, password): Promise<any> {
    if (isEmpty(getInfo.mobile) || isEmpty(getInfo.oldpassword) || isEmpty(getInfo.password))
      throw new FillFieldsException();

    const state = await this.checkState(username, password);
    if (!state) throw new UserCustomException('متاسفانه شما دسترسی ندارید', false, 401);
    const dataInfo = await this.userService.findByMobile(getInfo.mobile);
    if (!dataInfo) throw new UserNotfoundException();

    const valid = await this.compareHash(getInfo.oldpassword, dataInfo.password);
    if (!valid) throw new invalidUserPassException();

    console.log(state.user);
    console.log(dataInfo.ref);
    if (state.user === dataInfo.ref) {
      console.log(true);
      const salt = bcrypt.genSaltSync(15);
      const newpassword = bcrypt.hashSync(getInfo.password, salt);
      this.userService.findByIdAndUpdatePassword(dataInfo._id, newpassword);

      return this.successOpt();
    } else {
      console.log(false);
      return this.faildOpt();
    }
  }

  async login(getInfo: AuthServiceDto, username, password): Promise<any> {
    if (isEmpty(getInfo.mobile) || isEmpty(getInfo.password) || isEmpty(username) || isEmpty(password))
      throw new FillFieldsException();

    const state = await this.checkState(username, password);
    if (!state) throw new UserCustomException('متاسفانه شما دسترسی ندارید', false, 401);

    const dataInfo = await this.userService.findByMobile(getInfo.mobile);
    if (!dataInfo) throw new UserNotfoundException();

    const valid = await this.compareHash(getInfo.password, dataInfo.password);
    if (!valid) throw new invalidUserPassException();

    // const charge = await this.accountService.dechargeAccount(state.user, 'wallet', state.authamount);
    // if ( charge.balance <  state.authamount) throw new UserCustomException('متاسفانه شارژ به اتمام رسیده است', false, 202);

    return loginSuccessOpt(dataInfo);
  }

  async transfer(getInfo: AuthServiceDto, username, password): Promise<any> {
    if (isEmpty(getInfo.mobile) || isEmpty(username) || isEmpty(password)) throw new FillFieldsException();

    const state = await this.checkState(username, password);
    if (!state) throw new UserCustomException('متاسفانه شما دسترسی ندارید', false, 401);

    const dataInfo = await this.userService.findByMobile(getInfo.mobile);
    if (!dataInfo) throw new UserNotfoundException();

    return showUserDetails(dataInfo);
  }

  async confirmTansfer(account_No, amount, username, password): Promise<any> {
    if (isEmpty(account_No) || isEmpty(username) || isEmpty(password)) throw new FillFieldsException();

    const state = await this.checkState(username, password);
    if (!state) throw new UserCustomException('متاسفانه شما دسترسی ندارید', false, 401);

    const dataInfo = await this.userService.getInfoByAccountNo(account_No);
    if (!dataInfo) throw new UserNotfoundException();

    const charge = await this.accountService.chargeAccount(dataInfo._id, 'wallet', amount);
    if (!charge) throw new UserCustomException('متاسفانه عملیات با خطا مواجه شده است', false, 500);

    return successOpt();
  }

  async getBalance(getInfo: AuthServiceDto, username, password): Promise<any> {
    if (isEmpty(getInfo.mobile) || isEmpty(username) || isEmpty(password)) throw new FillFieldsException();

    const state = await this.checkState(username, password);
    if (!state) throw new UserCustomException('متاسفانه شما دسترسی ندارید', false, 401);

    const dataInfo = await this.userService.findByMobile(getInfo.mobile);
    if (!dataInfo) throw new UserNotfoundException();

    const wallet = await this.accountService.getBalance(dataInfo._id, 'wallet');

    if (!wallet) throw new InternalServerErrorException();

    return showBalanceSuccessOpt(wallet);
  }

  async submitShetabCard(getInfo: CardManagementApiDto, username, password): Promise<any> {
    if (
      isEmpty(getInfo.cardno) ||
      isEmpty(getInfo.mobile) ||
      isEmpty(getInfo.cardownerfullname) ||
      isEmpty(username) ||
      isEmpty(password)
    )
      throw new FillFieldsException();

    const state = await this.checkState(username, password);
    if (!state) throw new UserCustomException('متاسفانه شما دسترسی ندارید', false, 401);

    const dataInfo = await this.userService.findByMobile(getInfo.mobile);
    if (!dataInfo) throw new UserNotfoundException();

    getInfo.user = dataInfo._id;

    const data = await this.cardManagementService.insertCard(getInfo);
    if (!data) throw new InternalServerErrorException();

    return successOpt();
  }

  async deleteShetabCard(getInfo: CardManagementApiDto, username, password): Promise<any> {
    if (isEmpty(getInfo.cardno) || isEmpty(username) || isEmpty(password)) throw new FillFieldsException();

    const state = await this.checkState(username, password);
    if (!state) throw new UserCustomException('متاسفانه شما دسترسی ندارید', false, 401);

    const data = await this.cardManagementService.deleteCard(getInfo.cardno);
    if (!data) throw new InternalServerErrorException();

    return successOpt();
  }

  async getCardList(mobile, username, password): Promise<any> {
    if (isEmpty(mobile) || isEmpty(username) || isEmpty(password)) throw new FillFieldsException();

    const state = await this.checkState(username, password);
    if (!state) throw new UserCustomException('متاسفانه شما دسترسی ندارید', false, 401);

    const dataInfo = await this.userService.findByMobile(mobile);
    if (!dataInfo) throw new UserNotfoundException();

    const data = await this.cardManagementService.getListCards(dataInfo._id);

    return {
      success: true,
      status: 200,
      message: 'عملیات با موفقیت انجام شد',
      data: data,
    };
  }

  async compareHash(password: string | undefined, hash: string | undefined): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private async checkState(username, password): Promise<any> {
    const info = await this.apiPermService.getInfo(username, password);
    if (!info) return false;
    if (info.auth) {
      return info;
    } else {
      return false;
    }
  }

  private async checkUser(nationalcodex, mobilex): Promise<any> {
    const data = await this.userService.getdata(nationalcodex, mobilex);
    return data;
  }

  private successOpt() {
    return {
      success: true,
      status: 200,
      message: 'عملیات با موفقیت انجام شد',
    };
  }

  private faildOpt() {
    return {
      success: false,
      status: 401,
      message: 'متاسفانه به کاربر مورد نظر دسترسی ندارید ',
    };
  }

  private transform(data) {
    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      data: {
        fullname: data.fullname || 'بی نام',
        nationalcode: data.nationalcode,
        mobile: data.mobile,
        place: data.place || 'محل تولد',
        cardno: data.card.cardno,
        accountno: data.account_no,
        wallet: data.accounts[0].balance,
        walletcurrency: data.accounts[0].currency,
        credit: data.accounts[1].balance,
        creditcurrency: data.accounts[1].currency,
        discount: data.accounts[2].balance,
        discountcurrency: data.accounts[2].currency,
        idm: data.accounts[3].balance,
        idmcurrency: data.accounts[3].currency,
      },
    };
  }
}
