import { Injectable, loginSuccessOpt } from '@vision/common';
import { imageTransform } from '@vision/common/transform/image.transform';
import { Messages } from '@vision/common/constants/messages.const';
import { UserCreditCoreService } from '../../Core/credit/usercredit/credit-core.service';
import { isEmpty } from '@vision/common/utils/shared.utils';

@Injectable()
export class AuthService {
  constructor(private readonly userCreditService: UserCreditCoreService) {}

  static loginSuccess(
    user: any,
    token: any,
    creditcurrency,
    sitad,
    myToken?,
    staticamount?,
    remaindays?,
    unread?,
    clubData?
  ) {
    let walletx,
      walletcurrency,
      creditx,
      discountx,
      discountcurrency,
      org,
      orgcurrency = null;

    for (let i = 0; user.accounts.length > i; i++) {
      switch (user.accounts[i].type) {
        case 'wallet': {
          walletx = user.accounts[i].balance;
          walletcurrency = user.accounts[i].currency;
          break;
        }
        case 'discount': {
          discountx = user.accounts[i].balance;
          discountcurrency = user.accounts[i].currency;
          break;
        }
        case 'org': {
          org = user.accounts[i].balance;
          orgcurrency = user.accounts[i].currency;
          break;
        }
      }
    }

    // user.accounts.forEach( data => {
    // });
    let fullname: string;
    if (user.islegal) {
      fullname = user.legal.title + ' ' + user.legal.name;
    } else {
      fullname = user.fullname;
    }
    const data = {
      status: 200,
      success: true,
      message: Messages.success.login,
      mobile: '0' + user.mobile,
      token: token.accessToken,
      fullname: fullname || '',
      avatar: imageTransform(user.avatar),
      account_no: user.account_no,
      cardno: user.card ? user.card.cardno : '',
      profilestatus: 0,
      mytoken: myToken,
      staticamount: staticamount,
      title: user.title || 'کاربر',
      apsdk: false,
      unread: unread,
      greeting: '',
      refid: user.refid,
      sms: user.sms || false,
      maxcheckout: user.maxcheckout,
      perday: user.perday,
      perhour: user.perhour,
      wallet: walletx,
      walletCurrency: walletcurrency,
      credit: creditcurrency,
      discount: discountx,
      sitad: sitad,
      logourl: clubData.logo,
      clubname: clubData.clubname,
      idm: 0,
      organ: org || 0,
      remaindays: remaindays,
      checkout: user.checkout,
      clubinfo: clubData.info,
      type: user.type,
      vitrinAccess: user.vitrinAccess ?? false,
    };
    return data;
  }
  transformWithPagination(data) {
    return {
      status: 200,
      success: true,
      message: Messages.success.opt,
      data: data.docs || '',
      total: data.total || '',
      limit: data.limit || '',
      page: data.page || '',
      pages: data.pages || '',
    };
  }

  static invalidavtivation() {
    return {
      success: false,
      status: 305,
      message: Messages.activation.wrongcode,
    };
  }

  static inavtivated() {
    return {
      success: false,
      status: 304,
      message: Messages.user.disable,
    };
  }

  static avtivated() {
    return {
      success: true,
      status: 200,
      message: Messages.user.actived,
    };
  }

  static transformSuccess() {
    return {
      success: true,
      status: 200,
      message: Messages.user.register,
    };
  }
  static transformSuccessWithData(datax) {
    let tmp = Array();
    for (const item of datax) {
      tmp.push({
        userid: item._id,
        fullname: item.fullname,
        birthdate: item.birthdate,
        nationalcode: item.nationalcode,
        province: item.state,
        city: item.city,
        mobile: item.mobile,
        tell: item.tell,
      });
    }
    return {
      success: true,
      status: 200,
      message: Messages.success.opt,
      data: tmp,
    };
  }
  static isActive() {
    return {
      success: true,
      status: 200,
      message: Messages.user.active,
    };
  }
  static successOpt() {
    return {
      success: true,
      status: 200,
      message: Messages.success.opt,
    };
  }

  static validCode() {
    return {
      success: true,
      status: 200,
      message: Messages.success.successcode,
    };
  }
  static invalidCode() {
    return {
      success: false,
      status: 305,
      message: Messages.faild.wrongcode,
    };
  }
  static duplicateError() {
    return {
      success: false,
      status: 201,
      message: Messages.user.duplicated,
    };
  }
  async createToken(userid: string) {
    // const data = await this.aclService.getUser( userid );
    // const user: JwtPayload = { id: userid,  role: 'role'};
    // const accessToken = jwt.sign(user, process.env.SIGNIN_SECRET);
    // return {
    //   accessToken,
    // };
  }

  static getAccounts(accounts, todayCharge, blocked, credit, shopCredit) {
    let walletx,
      walletcurrency,
      creditx,
      creditcurrency,
      discountx,
      discountcurrency,
      org,
      lecreditx,
      lecreditcurrency,
      merchant_deposit,
      merchant_depositcurrency,
      orgcurrency = null;
    accounts.forEach((data) => {
      switch (data.type) {
        case 'wallet': {
          walletx = Math.floor(data.balance);
          walletcurrency = data.currency;
          break;
        }
        case 'credit': {
          creditx = Math.floor(data.balance);
          creditcurrency = data.currency;
          break;
        }
        case 'discount': {
          discountx = Math.floor(data.balance);
          discountcurrency = data.currency;
          break;
        }
        case 'org': {
          org = Math.floor(data.balance);
          orgcurrency = data.currency;
          break;
        }
        case 'merchant_deposit': {
          merchant_deposit = Math.floor(data.balance);
          merchant_depositcurrency = data.currency;
          break;
        }
        case 'lecredit': {
          lecreditx = Math.floor(data.balance);
          lecreditcurrency = data.currency;
        }
      }
    });
    let walletmod = walletx - todayCharge - blocked;
    if (walletx - todayCharge - blocked < 0) {
      walletmod = 0;
    }
    const data = {
      status: 200,
      success: true,
      message: Messages.success.opt,
      wallet: walletx,
      blockamount: todayCharge,
      blocked: blocked,
      walletmod: walletmod,
      walletCurrency: walletcurrency,
      credit: credit,
      shopCredit: shopCredit,
      discount: discountx,
      merchant_deposit,
      merchant_depositcurrency,
      lecredit: lecreditx ?? 0,
      idm: 0,
      organ: org || 0,
    };
    return data;
  }

  async getCreditBalance(userid: string): Promise<any> {
    const userBalance = await this.userCreditService.getCreditBalance(userid);
    if (isEmpty(userBalance)) {
      return 0;
    } else {
      return Math.ceil(userBalance[0].balance);
    }
  }
}
