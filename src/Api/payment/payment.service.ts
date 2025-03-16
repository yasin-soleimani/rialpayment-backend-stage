import {
  Injectable,
  InternalServerErrorException,
  successOpt,
  faildOpt,
  NotFoundException,
  successOptWithDataNoValidation,
} from '@vision/common';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { PaymentDto } from './dto/payment.dto';
import { UserService } from '../../Core/useraccount/user/user.service';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { AccountService } from '../../Core/useraccount/account/account.service';
import { notEnoughMoneyException } from '@vision/common/exceptions/notEnoughMoney.exception';
import { LoggercoreService } from '../../Core/logger/loggercore.service';
import { GeneralService } from '../../Core/service/general.service';
import axios, { AxiosInstance } from 'axios';
import * as UniqueNumber from 'unique-number';
import { isNull, isNullOrUndefined } from 'util';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { SafeboxCoreService } from '../../Core/safebox/safebox.sevice';
import { SafeBoxSendMessage } from '@vision/common/messages/SMS';
import { CreditHistoryCoreService } from '../../Core/credit/history/credit-history.service';
import { imageTransform } from '@vision/common/transform/image.transform';
import { NewQrPaymentService } from './services/new-qr-payment.service';
import { sendNotif } from '@vision/common/notify/notify.util';
import { MerchantCoreTerminalService } from '../../Core/merchant/services/merchant-terminal.service';
import { CardService } from '../../Core/useraccount/card/card.service';
import * as sha256 from 'sha256';
import { PaymentSafeService } from './services/payment-safe.service';
import { TaxiService } from '../taxi/taxi.service';
import { GetTaxiInformationDto } from '../../Core/taxi/dto/taxi-get-information.dto';
import { Request } from 'express';
import { PossibleTerminalTypeEnum } from './enums/possible-terminal-type.enum';
import { TicketsCoreService } from '../../Core/tickets/tickets.service';
import * as process from 'process';

@Injectable()
export class PaymentService {
  private client: AxiosInstance;

  constructor(
    private readonly userService: UserService,
    private readonly accountService: AccountService,
    private readonly loggerService: LoggercoreService,
    private readonly safeboxService: SafeboxCoreService,
    private readonly generalService: GeneralService,
    private readonly credithistoryService: CreditHistoryCoreService,
    private readonly newQrService: NewQrPaymentService,
    private readonly terminalService: MerchantCoreTerminalService,
    private readonly cardService: CardService,
    private readonly safePaymentService: PaymentSafeService,
    private readonly taxiApiService: TaxiService,
    private readonly ticketsCoreService: TicketsCoreService
  ) {
    this.client = axios.create({
      baseURL: process.env.SOCKET_SERVICE_URL,
    });
  }

  checkPayid(paymentDto: PaymentDto) {
    if (isEmpty(paymentDto.payid)) throw new FillFieldsException();
  }
  // validation fields
  checkConfirm(paymentDto: PaymentDto) {
    if (isEmpty(paymentDto.payid) || isEmpty(paymentDto.amount)) throw new FillFieldsException();
  }

  // getUser Information
  async getInfo(paymentDto: PaymentDto, userid) {
    let splited;
    if (!isEmpty(paymentDto._id)) {
    }

    // get Type For Terminals
    //  terminal 7
    // check terminalid
    let data;
    if (isEmpty(paymentDto._id)) {
      this.checkPayid(paymentDto);
      const res = await this.userService.getInfoByAccountNo(paymentDto.payid);
      if (!res) throw new UserNotfoundException();
      data = this.infoTransform(res);
    } else {
      splited = paymentDto._id.split('_');
      if (splited.length < 2) {
      } else {
        return this.safePaymentService.getInformation(paymentDto);
      }
      if (isEmpty(paymentDto._id)) throw new FillFieldsException();
      const res = await this.terminalService.getInfoByID(paymentDto._id);
      if (!res) throw new UserNotfoundException();
      data = this.getInfoTransform(res);
    }
    const remainTicket = await this.ticketsCoreService.getLastTicketByUser(userid);
    return { ...data, ticket: remainTicket && remainTicket?.terminals?.includes(paymentDto._id) ? remainTicket : null };
  }

  async confirmPayment(paymentDto: PaymentDto, userid: string): Promise<any> {
    const userInfo = await this.userService.getInfoByUserid(userid);
    if (!userInfo) throw new NotFoundException();
    if (isEmpty(userInfo.fullname) || userInfo.block === true || userInfo.checkout === false)
      throw new UserCustomException('شما مجاز به انجام تراکنش نمی باشید');
    /*****
     * type 1 - payment wallet
     * type 2 - trasnfer wallet
     * type 3 - payment credit
     * type 4 - transfer credit
     * type 5 - installs payment
     * type 6 - new QR payment
     * type 7 - Terminal Payment
     */
    switch (parseInt(paymentDto.type.toString())) {
      // payment with wallet
      case 1: {
        return await this.PayWallet(paymentDto, userid);
      }

      // transfer money with wallet
      case 2: {
        return await this.checkWalletTransferType(paymentDto, userid);
      }

      // payment with credit
      case 3: {
        console.log(3);
        return await this.CreditPayment(paymentDto, userid);
      }

      case 5: {
        console.log(4);
        return await this.installsPayment(paymentDto, userid);
      }

      case 6: {
        return this.newQrService.pay(paymentDto.barcode, userid, paymentDto.amount);
      }

      default: {
        console.log(2);
        return await this.checkWalletTransferType(paymentDto, userid);
        break;
      }
    }
  }

  async PayWallet(paymentDto: PaymentDto, userid: string): Promise<any> {
    this.checkConfirm(paymentDto);
    const user = await this.userService.findUserAll(userid);
    if (!user) throw new UserNotfoundException();
    if (user.block == true) throw new UserCustomException('متاسفانه حساب شما مسدود شده است با پشتیبانی تماس بگیرید');
    const customer = await this.userService.getInfoByAccountNo(paymentDto.payid);
    if (!customer) throw new UserNotfoundException();
    this.checkBalanceWallet(user, paymentDto.amount);
    await this.accountService.dechargeAccount(userid, 'wallet', paymentDto.amount);
    this.accountService.chargeAccount(customer._id, 'wallet', paymentDto.amount);
    const title = 'خرید از ' + customer.fullname;
    const uniqueNumber = new UniqueNumber(true);
    const ref = 'Pay-' + uniqueNumber.generate();
    const log = this.setLogg(title, ref, paymentDto.amount, true, user._id, customer._id);
    const logInfo = await this.loggerService.newLogg(log);
    this.client
      .post('all', {
        title: 'خرید نقدی',
        message: 'به کیف پول شما ' + paymentDto.amount + ' ریال انتقال یافت',
        clientid: customer.clientid,
      })
      .catch((e) => console.log('err call socket: ', e));
    sendNotif(customer.fcm, paymentDto.amount);
    return this.successOpt(customer, logInfo);
  }

  private async checkWalletTransferType(paymentDto: PaymentDto, userid: string): Promise<any> {
    const userInfo = await this.userService.getInfoByUserid(userid);
    if (userInfo.block == true)
      throw new UserCustomException('متاسفانه حساب شما مسدود شده است با پشتیبانی تماس بگیرید');
    if (userInfo.checkout && userInfo.checkout == false)
      throw new UserCustomException('متاسفانه شما نمی توانید پول را انتقال دهید', false, 500);
    const reg = new RegExp(/^0([\d]{0})[(\D\s)]?[\d]{11}$/);
    const transType = paymentDto.payid.match(reg);
    if (isNullOrUndefined(transType)) {
      return await this.walletTransfer(paymentDto, userid);
    } else {
      return await this.safeBoxTransfer(paymentDto, userid);
    }
  }

  async safeBoxTransfer(paymentDto: PaymentDto, userid): Promise<any> {
    const userInfo = await this.userService.getInfoByUserid(userid);
    if (!userInfo) throw new InternalServerErrorException();
    if (userInfo.block == true)
      throw new UserCustomException('متاسفانه حساب شما مسدود شده است با پشتیبانی تماس بگیرید');
    if (userInfo.checkout == false) throw new UserCustomException('متاسفانه حساب کاربری شما اعتبار سنجی نشده است');
    const mobile = paymentDto.payid.split('_');
    await this.checkBalanceTrans(userid, paymentDto.amount);
    let title;
    if (isEmpty(paymentDto.description)) {
      title = 'انتقال وجه به ' + mobile[1];
    } else {
      title = 'انتقال وجه به ' + mobile[1] + '-' + paymentDto.description;
    }
    const uniqueNumber = new UniqueNumber(true);
    const ref = 'Trans-' + uniqueNumber.generate();
    const info = this.safeboxService.safeboxSetter(mobile[1], paymentDto.amount, userid, ref);
    const data = await this.safeboxService.newItem(info);
    if (!data) throw new InternalServerErrorException();
    const log = this.setLogg(title, ref, paymentDto.amount, true, userid, userid);
    const logInfo = await this.loggerService.newLogg(log);
    const user = await this.userService.findUserAll(userid);
    if (!user) throw new UserNotfoundException();
    if (logInfo) {
      const Message = SafeBoxSendMessage(paymentDto.amount, user.fullname);
      this.generalService.AsanaksendSMS(
        process.env.ASANAK_USERNAME,
        process.env.ASANAK_PASSWORD,
        process.env.ASANAK_NUMBER,
        mobile[1],
        Message
      );
      await this.accountService.dechargeAccount(userid, 'wallet', paymentDto.amount);
      return successOpt();
    } else {
      return faildOpt();
    }
  }

  async walletTransfer(paymentDto: PaymentDto, userid: string): Promise<any> {
    this.checkConfirm(paymentDto);
    const user = await this.userService.findUserAll(userid);
    console.log(user, 'user');
    console.log(userid, 'uid');
    if (!user) throw new UserNotfoundException();
    if (user.block == true) throw new UserCustomException('متاسفانه حساب شما مسدود شده است با پشتیبانی تماس بگیرید');
    const customer = await this.userService.getInfoByAccountNo(paymentDto.payid);
    if (!customer) throw new UserNotfoundException();
    this.checkBalanceWallet(user, paymentDto.amount);
    await this.accountService.dechargeAccount(userid, 'wallet', paymentDto.amount);
    this.accountService.chargeAccount(customer._id, 'wallet', paymentDto.amount);
    let title;
    if (isEmpty(paymentDto.description)) {
      title = 'انتقال وجه به ' + customer.fullname;
    } else {
      title = 'انتقال وجه به ' + customer.fullname + '-' + paymentDto.description;
    }
    const uniqueNumber = new UniqueNumber(true);
    const ref = 'Trans-' + uniqueNumber.generate();
    const log = this.setLogg(title, ref, paymentDto.amount, true, user._id, customer._id);
    const logInfo = await this.loggerService.newLogg(log);
    this.client
      .post('all', {
        title: 'واریز وجه',
        message: 'به کیف پول شما ' + paymentDto.amount + ' ریال انتقال یافت',
        clientid: customer.clientid,
      })
      .catch((e) => console.log('err call socket: ', e));
    sendNotif(customer.fcm, paymentDto.amount);
    const returndata = this.successOpt(customer, logInfo);
    console.log(returndata);
    return returndata;
  }

  async CreditPayment(paymentDto: PaymentDto, userid: string): Promise<any> {
    this.checkConfirm(paymentDto);
    const user = await this.userService.findUserAll(userid);
    if (!user) throw new UserNotfoundException();
    if (user.block == true) throw new UserCustomException('متاسفانه حساب شما مسدود شده است با پشتیبانی تماس بگیرید');
    const customer = await this.userService.getInfoByAccountNo(paymentDto.payid);
    if (!customer) throw new UserNotfoundException();
    this.checkBalanceCredit(user, paymentDto.amount, 'متاسفانه اعتبار کافی نمی باشد');
    await this.accountService.dechargeAccount(userid, 'credit', paymentDto.amount);
    await this.accountService.chargeAccount(customer._id, 'credit', paymentDto.amount);
    const title = 'خرید اعتباری از ' + customer.merchant.logo;
    const uniqueNumber = new UniqueNumber(true);
    const ref = 'PayCredit-' + uniqueNumber.generate();
    const log = this.setLogg(title, ref, paymentDto.amount, true, user._id, customer._id);
    const logInfo = await this.loggerService.newLogg(log);
    // const msgBody = 'مبلغ :  ' + paymentDto.amount + '  ریال به کیف پول شما واریز شد ';
    // const mobile1 = 0 + customer.mobile;
    this.client
      .post('all', {
        title: 'خرید اعتباری',
        message: 'به اعتبار شما ' + paymentDto.amount + ' ریال انتقال یافت',
        clientid: customer.clientid,
      })
      .catch((e) => console.log('err call socket: ', e));
    sendNotif(customer.fcm, paymentDto.amount);

    // this.generalService.AsanaksendSMS(process.env.ASANAK_USERNAME,
    //   process.env.ASANAK_PASSWORD, process.env.ASANAK_NUMBER,
    //   mobile1,  msgBody);
    return this.successOpt(customer, logInfo);
  }

  async installsPayment(paymentDto: PaymentDto, userid: string): Promise<any> {
    //this.checkConfirm(paymentDto);
    if (isEmpty(paymentDto.installs)) throw new FillFieldsException();
    let clientid;
    let fcmid;
    let installments = 0;
    const user = await this.userService.findUserAll(userid);
    if (!user) throw new UserNotfoundException();
    if (user.block == true) throw new UserCustomException('متاسفانه حساب شما مسدود شده است با پشتیبانی تماس بگیرید');
    this.checkBalanceWallet(user, paymentDto.amount);

    const rcvData = JSON.parse(paymentDto.installs);

    for (let i = 0; i < rcvData.data.length; i++) {
      const balance = await this.credithistoryService.getInstallDetails(rcvData.data[i].id);
      if (balance) {
        // if ( !isEmpty(balance.shopid.to.clientid) || isNull(balance.shopid.to.clientid)) clientid = balance.shopid.to.clientid ;
        // if ( !isEmpty( balance.shopid.to.fcm) || isNull( balance.shopid.to.fcm)) fcmid = balance.shopid.to.fcm;

        this.accountService.dechargeAccount(balance.shopid.from, 'wallet', rcvData.data[i].amount).then((value) => {
          console.log('wallet decharge', value);
        });
        this.accountService.chargeAccount(balance.shopid.to, 'wallet', rcvData.data[i].amount).then((value) => {
          console.log('wallet decharge', value);
        });

        const today = new Date();
        const payData = this.credithistoryService.payToInstall(rcvData.data[i].id, rcvData.data[i].amount, today);
        if (payData) {
          const title = 'پرداخت بابت خرید اعتباری ';
          const uniqueNumber = new UniqueNumber(true);
          const ref = 'CreditPay-' + uniqueNumber.generate();
          const log = this.setLogg(title, ref, paymentDto.amount, true, balance.shopid.from, balance.shopid.to);
          const logInfo = await this.loggerService.newLogg(log);
          this.credithistoryService.updateRemain(balance.shopid.id);
        } else {
          return faildOpt();
        }
      }
    }

    return successOpt();
  }

  private async checkPin(userid, pin): Promise<any> {
    const cardInfo = await this.cardService.getCardByUserID(userid);
    if (cardInfo) throw new UserCustomException('کارت یافت نشد', false, 404);

    const cardPin = sha256(cardInfo.pin);
    if (cardPin != pin) throw new UserCustomException('رمز کارت اشتباه ', false, 500);
    return true;
  }

  private setLogg(titlex, refx, amountx, statusx, fromid, toid) {
    return {
      title: titlex,
      ref: refx,
      amount: amountx,
      status: statusx,
      from: fromid,
      to: toid,
    };
  }

  private getWallet(user: any) {
    for (const index in user.accounts) {
      if (user.accounts[index].type === 'wallet') {
        return index;
      }
    }
  }

  private getCredit(user: any) {
    for (const index in user.accounts) {
      if (user.accounts[index].type === 'credit') {
        return index;
      }
    }
  }

  private checkBalanceWallet(user, amount) {
    const wallet = this.getWallet(user);
    if (user.accounts[wallet].balance < amount) throw new notEnoughMoneyException();
  }

  private async checkBalanceTrans(userid, amount): Promise<any> {
    const data = await this.accountService.getBalance(userid, 'wallet');
    if (data) {
      if (data.balance < amount) {
        throw new notEnoughMoneyException();
      }
    } else {
      throw new UserCustomException('متاسفانه عملیات با خطا مواجه شده است', false, 500);
    }
  }

  private checkBalanceCredit(user, amount, msg) {
    const credit = this.getCredit(user);
    if (user.accounts[credit].balance < amount) throw new UserCustomException(msg, false, 402);
  }

  private successOpt(info, loginfo) {
    return {
      success: true,
      status: 200,
      message: 'عملیات با موفقیت انجام شد',
      cardno: info.card.cardno,
      date: loginfo.createdAt,
      ref: loginfo.ref,
      account_no: info.account_no,
    };
  }

  private getInfoTransform(data) {
    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      fullname: data.merchant.title,
      avatar: imageTransform(data.merchant.logo),
      merchant: null,
    };
  }

  private infoTransform(user) {
    let status,
      credit,
      discount: boolean = false;
    let merchant;
    if (!isNull(user.merchant)) {
      status = true;
      discount = true;
      merchant = {
        status: status,
        logo: imageTransform(user.merchant.logo),
        title: user.merchant.title,
        credit: user.merchant.credit || false,
        discount: discount,
      };
    } else {
      merchant = {
        status: false,
      };
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
      fullname: fullname,
      avatar: imageTransform(user.avatar),
      merchant: merchant,
    };
  }

  async checkTerminalId(terminalId: string, req: Request): Promise<any> {
    const terminal = await this.terminalService.getTerminalInfoByTerminalid(parseInt(terminalId));
    const isTaxiTerminal = await this.isTaxiTerminal(terminalId);

    if (terminal) {
      const data = {
        _id: terminal._id,
        price: 0,
        type: PossibleTerminalTypeEnum.ICC_TERMINAL,
        id: terminalId,
      };
      return successOptWithDataNoValidation(data);
    } else if (isTaxiTerminal) {
      const data = {
        _id: '',
        price: 0,
        type: PossibleTerminalTypeEnum.TAXI_TERMINAL,
        id: '',
      };
      return successOptWithDataNoValidation(data);
    } else {
      return {
        status: 400,
        success: false,
        message: 'پذیرنده یافت نشد',
        data: {},
      };
    }
  }

  private async isTaxiTerminal(terminalId: string): Promise<boolean> {
    return terminalId.startsWith('10');
  }
}
