import {
  Injectable,
  InternalServerErrorException,
  successOptWithDataNoValidation,
  successOptWithData,
} from '@vision/common';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { notEnoughMoneyException } from '@vision/common/exceptions/notEnoughMoney.exception';
import { MainInsurancePaymentTypeConst } from '../../../Core/main-insurance/const/payment-type.const';
import { InternetPaymentGatewayService } from '../../../Service/internet-payment-gateway/ipg.service';

@Injectable()
export class InsurancePaymentApiService {
  constructor(
    private readonly accountService: AccountService,
    private readonly userService: UserService,
    private readonly iccIpgService: InternetPaymentGatewayService
  ) {}

  async play(type, mobile, amount, productInfo, data): Promise<any> {
    switch (type) {
      case MainInsurancePaymentTypeConst.wallet: {
        return this.wallet(mobile, amount, productInfo);
      }

      case MainInsurancePaymentTypeConst['ipg-closeloop']: {
        return this.ipgCloseloop(mobile, amount, data);
      }

      case MainInsurancePaymentTypeConst['ipg-shetab']: {
        throw new UserCustomException('فعلا امکان خرید شتابی امکانپذیر نمی باشد', false, 400);
      }

      default: {
        throw new InternalServerErrorException();
      }
    }
  }

  async shetabIpg(): Promise<any> {
    throw new UserCustomException('غیرفعال می باشد');
  }

  async wallet(mobile: string, amount: number, productInfo): Promise<any> {
    const userInfo = await this.userService.getInfoByMobile(Number(mobile));
    if (!userInfo) throw new UserCustomException('کاربر یافت نشد', false, 404);

    const wallet = await this.accountService.getBalance(userInfo._id, 'wallet');
    if (wallet.balance < amount) throw new notEnoughMoneyException();

    await this.accountService.dechargeAccount(userInfo._id, 'wallet', amount);
    const title = 'خرید بیمه ' + productInfo.title;
    const data = await this.accountService.accountSetLogg(title, 'Insurance', amount, true, userInfo._id, null);

    return successOptWithDataNoValidation(data);
  }

  async ipgCloseloop(mobile: string, amount: number, data): Promise<any> {
    const ref = 'Insurance-' + new Date().getTime();
    const reqInfo = await this.iccFormat(amount, ref, data._id);

    const tokenInfo = await this.iccIpgService.getToken(reqInfo, { ip: '::1' });
    if (tokenInfo.status != 0) throw new UserCustomException('عملیات با خطا مواجه شده است', false, 500);

    return successOptWithData(tokenInfo.token);
  }

  private iccFormat(amount: number, invoiceid, payload) {
    return {
      terminalid: 2005207,
      paylaod: payload,
      amount,
      callbackurl: 'https://core-backend.rialpayment.ir/v1/insurance/payment/status',
      invoiceid: invoiceid,
    };
  }
}
