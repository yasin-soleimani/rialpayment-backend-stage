import axios, { AxiosInstance } from 'axios';
import { CheckoutSubmitCoreDto } from './dto/checkoutsubmit.dto';
import { checkoutDeta, checkoutType, TransferType } from '@vision/common/constants/banks.const';
import { BadRequestException, Injectable, successOpt } from '@vision/common';
import { CheckoutSubmitCommonService } from './services/submit-common.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { CheckoutCoreService } from '../checkout/checkoutcore.service';
import { AccountService } from '../../useraccount/account/account.service';
import { UserService } from '../../useraccount/user/user.service';
import { CheckoutCurrentAccountCoreService } from '../banks/services/current-acount.service';
import { dateWithTz } from '@vision/common/utils/month-diff.util';

@Injectable()
export class CheckoutSubmitBankService {
  private client: AxiosInstance;

  constructor(
    private readonly commonService: CheckoutSubmitCommonService,
    private readonly checkoutService: CheckoutCoreService,
    private readonly accountService: AccountService,
    private readonly userService: UserService,
    private readonly checkoutCurrentAccount: CheckoutCurrentAccountCoreService
  ) {
    this.client = axios.create({
      baseURL: checkoutDeta.url,
      timeout: 3600000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async submit(getInfo: CheckoutSubmitCoreDto): Promise<any> {
    const info = await this.userService.getInfoByUserid(getInfo.user);
    const userInfo = await this.userService.getInfoByUserid(getInfo.user);
    if (userInfo.block === true || userInfo.checkout === false)
      throw new UserCustomException('متاسفانه حساب شما مسدود شده است با پشتیبانی تماس بگیرید');
    const todayCheckout = await this.commonService.getTodatCheckouts(getInfo.user);
    if (todayCheckout >= info.perday) throw new UserCustomException('تعداد دفعات تسویه روزانه شما به اتمام رسیده است');
    await this.commonService.commonCheck(getInfo, info.maxcheckout, info.perhour);
    const checkout = await this.checkoutService.getInfo(getInfo.account, getInfo.user);
    if (!checkout) throw new UserCustomException('شماره حساب شما در سیستم یافت نشد', false, 701);
    const account = await this.accountService.getWallet(getInfo.user);
    if (!account || (account && account.balance < getInfo.amount))
      throw new BadRequestException('موجودی حساب شما کافی نمیباشد');
    // temporarily disable instant checkout
    // TODO: we need to implement a system to handle this situation in backoffice
    if (checkout.type === 1) {
      throw new UserCustomException(
        'در حال حاضر امکان استفاده از تسویه آنی میسر نمی‌باشد. لطفا جهت تسویه از تسویه شاپرکی (شماره شبا) استفاده نمایید',
        false,
        702
      );
    }
    // end of disabling instant checkout section
    const accountInfo = await this.checkoutCurrentAccount.getCurrentAccount(Number(getInfo.amount));
    this.checkout(getInfo, checkout, userInfo, accountInfo);
    return {
      status: 200,
      success: true,
      message: 'درخواست شما با موفقیت ثبت شد',
    };
  }

  private async checkout(getInfo: CheckoutSubmitCoreDto, checkout, userInfo, accountInfo): Promise<any> {
    const banktype = await this.commonService.selectBank(checkout.bankname);
    const submitReqInfo = await this.commonService.submitReq(getInfo, checkout, accountInfo._id);
    this.accountService.dechargeAccount(getInfo.user, 'wallet', getInfo.amount).then(async (res) => {
      if (res) {
        const desc = ' درخواست تسویه از کیف پول ' + userInfo.fullname;
        const data = await this.selector(userInfo, banktype, checkout, getInfo, desc, accountInfo);
        const title = 'درخواست تسویه حساب به ' + checkout.bankname + ' شماره حساب ' + checkout.account;
        this.accountService.accountSetLogg(title, 'Checkout', getInfo.amount, true, null, userInfo._id);
        this.final(data, userInfo, checkout, getInfo, submitReqInfo);
      }
    });
  }

  private async final(data, userInfo, checkout, getInfo, submitReqInfo): Promise<any> {
    if (data.status == 200) {
      const now = dateWithTz();
      await this.checkoutCurrentAccount.incBalance(now, parseInt(getInfo.amount));
      this.commonService.updateReq(submitReqInfo._id, JSON.stringify(data), data.status);
      const title = 'واریز وجه به بانک ' + checkout.bankname + ' شماره حساب ' + checkout.account;
      this.accountService.accountSetLogg(title, 'Checkout', getInfo.amount, true, null, userInfo._id);
      this.commonService.wage(userInfo._id, getInfo.amount).then((result) => console.log(result, 'result'));
    } else {
      this.commonService.updateReq(submitReqInfo._id, JSON.stringify(data), data.status);
      const title = 'اصلاحیه تسویه حساب به بانک ' + checkout.bankname + ' شماره حساب ' + checkout.account;
      this.accountService.chargeAccount(userInfo._id, 'wallet', getInfo.amount);
      this.accountService.accountSetLogg(title, 'Checkout', getInfo.amount, true, null, userInfo._id);
    }
  }
  private async selector(userInfo, banktype, checkout, getInfo, description, accountInfo): Promise<any> {
    switch (checkout.type) {
      case TransferType.sheba: {
        return this.shebaTransfer(userInfo, banktype, checkout, getInfo, description, accountInfo);
      }

      case TransferType.internal: {
        return this.internalTransfer(userInfo, banktype, checkout, getInfo, description, accountInfo);
      }
    }
  }

  private async shebaTransfer(userInfo, banktype, checkout, getInfo, description, accountInfo): Promise<any> {
    return this.isSheba(userInfo, banktype, checkout, getInfo, description, accountInfo);
  }

  private async isSheba(userInfo, banktype, checkout, getInfo, description, accountInfo): Promise<any> {
    const args = this.makeArgs(
      1,
      '0',
      checkout.account,
      getInfo.amount,
      userInfo.fullname,
      userInfo.fullname,
      userInfo.nationalcode,
      description,
      1,
      'تهران پارک وی',
      userInfo.mobile,
      accountInfo
    );
    return this.bankcheckout(args);
  }

  private async internalTransfer(userInfo, banktype, checkout, getInfo, description, accountInfo): Promise<any> {
    return this.isInternal(userInfo, banktype, checkout, getInfo, description, accountInfo);
  }

  private async isInternal(userInfo, banktype, checkout, getInfo, description, accountInfo): Promise<any> {
    const args = this.makeArgs(
      1,
      checkout.account,
      '',
      getInfo.amount,
      userInfo.fullname,
      userInfo.fullname,
      userInfo.nationalcode,
      description,
      3,
      'تهران پارک وی',
      userInfo.mobile,
      accountInfo
    );
    const client = await this.bankcheckout(args);
    return client;
  }

  private async bankcheckout(args): Promise<any> {
    const client = await this.client.post('/', args).catch((err) => {
      return {
        data: {
          status: 500,
          success: false,
          message: err,
        },
      };
    });
    console.log(client);
    return client.data;
  }

  private makeArgs(
    bank,
    dest,
    sheba,
    amountx,
    name,
    lastname,
    nin,
    descriptionx,
    transType,
    address,
    mobile,
    accountInfo
  ) {
    /*
     * 1 - paya
     * 2 - satna
     * 3 - internal account
     * 4 - internal card
     * 5 - shetab card
     * 6 - information
     */
    const args = {
      DestShebaAccountNumber: sheba,
      DestAccountNumber: dest,
      TypeTransfer: transType,
      Descriptions: descriptionx,
      DestFirstName: name,
      DestLastName: lastname,
      DestAddress: address,
      DestNationalcode: nin,
      disBranchcode: '4519',
      phoneNumber: mobile,
      DestSepahCard: '0',
      DestOtherCard: '0',
      Amount: amountx,
      Token_Re: '',
      DestAccountType: '71',
      BankType: bank,
      BankAccount: accountInfo.account,
      BankUsername: accountInfo.username,
      BankPassword: accountInfo.password,
      BankStaticPin: accountInfo.staticpin,
    };

    return args;
  }

  async walletCharge(userid): Promise<any> {}

  async getAllReport(from, to, page): Promise<any> {
    return this.commonService.getReportAll(from, to, page);
  }
}
