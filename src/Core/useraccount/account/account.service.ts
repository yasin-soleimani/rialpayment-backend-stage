import { Model } from 'mongoose';
import { Injectable, Inject } from '@vision/common';
import { Account } from './interfaces/account.interface';
import { CardcounterService } from '../cardcounter/cardcounter.service';
import * as farmhash from 'farmhash';
import { UserService } from '../user/user.service';
import * as mongoose from 'mongoose';
import { CardcounterSchema } from '../cardcounter/schemas/cardcounter.schema';
import { SafeboxCoreService } from '../../safebox/safebox.sevice';
import { LoggercoreService } from '../../logger/loggercore.service';
import { ReciveAccountBalanceMessage, SendAccountBalanceMessage } from '@vision/common/messages/SMS';
import { SendAsanakSms } from '@vision/common/notify/sms.util';
import { LogegerCoreTodayService } from '../../logger/services/today-log.service';
import { GlobalClubService } from '../../global-club/global-club.service';
import { GlobalClubData } from '../../global-club/interfaces/global-club.interface';

@Injectable()
export class AccountService {
  constructor(
    @Inject('AccountModel') private readonly AccountModel: Model<Account>,
    private readonly counterService: CardcounterService,
    private readonly userService: UserService,
    private readonly loggerService: LoggercoreService,
    private readonly todayChargeService: LogegerCoreTodayService,
    private readonly safeBox: SafeboxCoreService,
    private readonly globalClubService: GlobalClubService
  ) {}

  async chargeAccount(userid: string, typex: string, amount: number): Promise<any> {
    const query = { $and: [{ user: userid }, { type: typex }] };
    return await this.AccountModel.findOneAndUpdate(
      query,
      { $inc: { balance: amount } },
      { new: true, upsert: true }
    ).exec();
  }

  async dechargeAccount(userid: string, typex: string, amount: number): Promise<any> {
    const query = { $and: [{ user: userid }, { type: typex }] };
    return await this.AccountModel.findOneAndUpdate(query, { $inc: { balance: -amount } }).exec();
  }

  async getAccounts(userid: any): Promise<any> {
    return await this.AccountModel.find({ user: userid }).exec();
  }

  async getBalance(userid, typex): Promise<any> {
    return this.AccountModel.findOne({ $and: [{ user: userid }, { type: typex }] });
  }

  async getWallet(userid: string): Promise<any> {
    const query = { $and: [{ user: userid }, { type: 'wallet' }] };
    return await this.AccountModel.findOne(query).exec();
  }

  // make wallet
  async makeWallet(userid: string) {
    const params = {
      user: userid,
      type: 'wallet',
      balance: 0,
      currency: 'rial',
    };
    const createdAccount = new this.AccountModel(params);
    const walletData = await createdAccount.save();
    const getMobile = await this.userService.getInfoByUserid(userid);
    // safeboxUpdater(getMobile.mobile, userid);
    const data = await this.safeBox.chargeAccount(getMobile.mobile, userid);
    if (data) {
      data.forEach((value) => {
        this.chargeAccount(userid, 'wallet', value.amount);
        this.safeBox.updateSafebox(value._id);
        let fullname;
        if (value.from.fullname) {
          fullname = value.from.fullname;
        } else {
          fullname = value.from.mobile;
        }
        const title = 'انتقال از صندوق امن - فرستنده : ' + fullname;
        this.loggerService.submitNewLogg(title, 'Trans', value.amount, true, value.user._id, userid);
      });
    }
    return walletData;
  }

  // make credit
  async makeCredit(userid: string) {
    const params = {
      user: userid,
      type: 'credit',
      balance: 0,
      currency: 'rial',
    };
    const createdAccount = new this.AccountModel(params);
    return await createdAccount.save();
  }

  // make Discount
  async makeDiscount(userid: string) {
    const params = {
      user: userid,
      type: 'discount',
      balance: 0,
      currency: 'rial',
    };
    const createdAccount = new this.AccountModel(params);
    return await createdAccount.save();
  }

  // make idm
  async makeIdm(userid: string) {
    const params = {
      user: userid,
      type: 'idm',
      balance: 0,
      currency: 'rial',
    };
    const createdAccount = new this.AccountModel(params);
    return await createdAccount.save();
  }

  // make leasing credit
  async makeLeasingCredit(userid: string) {
    const params = {
      user: userid,
      type: 'lecredit',
      balance: 0,
      currency: 'rial',
    };
    const createdAccount = new this.AccountModel(params);
    return await createdAccount.save();
  }

  // make account no
  async makeAccountID(userid: string) {
    this.counterService.getAccountNumber().then((resault) => {
      const account = farmhash.fingerprint32(new Buffer(resault.acc));
      return this.userService.findAndUpdate(userid, account);
    });
  }

  async makeAccountIDwithXlsx(userid: string): Promise<any> {
    this.counterService.getNumbersAccounts().then((resault) => {
      const account = farmhash.fingerprint32(new Buffer(resault.acc));
      return this.userService.findAndUpdate(userid, account);
    });
  }

  async returnMakeAccountID(): Promise<any> {
    let counter = mongoose.model('Cardcounter', CardcounterSchema);
  }

  async checkBalance(userid, amount, type): Promise<any> {
    const data = await this.AccountModel.findOne({ user: userid, type: type });
    if (data) {
      if (data.balance >= amount) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  async makeWalletBulk(userid: string) {
    const params = {
      user: userid,
      type: 'wallet',
      balance: 0,
      currency: 'rial',
    };
    return await this.AccountModel.insertMany(params, { ordered: false });
  }

  async makeCreditBulk(userid: string) {
    const params = {
      user: userid,
      type: 'credit',
      balance: 0,
      currency: 'rial',
    };
    return await this.AccountModel.insertMany(params, { ordered: false });
  }

  async makeIdmBulk(userid: string) {
    const params = {
      user: userid,
      type: 'idm',
      balance: 0,
      currency: 'rial',
    };
    return await this.AccountModel.insertMany(params, { ordered: false });
  }

  async makeDiscountBulk(userid: string) {
    const params = {
      user: userid,
      type: 'discount',
      balance: 0,
      currency: 'rial',
    };
    return await this.AccountModel.insertMany(params, { ordered: false });
  }

  async accountSetLogg(titlex, type, amount, status, from, to, mobile?): Promise<any> {
    const senderBalance = await this.getBalance(from, 'wallet')
      .then(async (res) => {
        if (res) {
          const creditBalance = await this.getBalance(from, 'discount').catch(console.log);
          if (status === true) this.sendMessage(from, amount, res.balance, 1, creditBalance?.balance ?? '');
        }
        return res;
      })
      .catch((err) => {
        console.log(err, 'receiveBalance');
      });
    const receiveBalance = await this.getBalance(to, 'wallet')
      .then(async (res) => {
        if (res) {
          const creditBalance = await this.getBalance(to, 'discount').catch(console.log);
          if (status === true) this.sendMessage(to, amount, res.balance, 2, creditBalance?.balance ?? '');
        }
        return res;
      })
      .catch((err) => {
        console.log(err, 'receiveBalance');
      });
    let tobalance,
      rebalance = 0;
    if (senderBalance) rebalance = senderBalance.balance;
    if (receiveBalance) tobalance = receiveBalance.balance;
    return this.loggerService.submitNewLogg(titlex, type, amount, status, from, to, tobalance, rebalance, mobile);
  }

  async accountSetLoggWithRef(titlex, ref, amount, status, from, to, mobile?): Promise<any> {
    const senderBalance = await this.getBalance(from, 'wallet')
      .then(async (res) => {
        if (res) {
          const creditBalance = await this.getBalance(from, 'discount').catch(console.log);
          if (status === true) this.sendMessage(from, amount, res.balance, 1, creditBalance?.balance ?? '');
        }
        return res;
      })
      .catch((err) => {});
    const receiveBalance = await this.getBalance(to, 'wallet')
      .then(async (res) => {
        if (res) {
          const creditBalance = await this.getBalance(to, 'discount').catch(console.log);
          if (status === true) this.sendMessage(to, amount, res.balance, 2, creditBalance?.balance ?? '');
        }
        return res;
      })
      .catch((err) => {
        console.log(err, 'receiveBalance');
      });
    let tobalance,
      rebalance = 0;
    if (senderBalance) rebalance = senderBalance.balance;
    if (receiveBalance) tobalance = receiveBalance.balance;
    return this.loggerService.submitNewLoggWithRef(titlex, ref, amount, status, from, to, tobalance, rebalance, mobile);
  }

  async sendMessage(userid: string, amount, balance, type, balanceCredit = ''): Promise<any> {
    const globalClubData = await this.globalClubService.getClubData(userid);

    this.userService.getInfoByUserid(userid).then((result) => {
      if (result && result.sms == true) {
        let msg;

        if (type == 1) {
          this.smsMessageGenerator(globalClubData, 'send', amount, balance, result.fullname, balanceCredit).then(
            (message) => (msg = message)
          );
        } else {
          this.smsMessageGenerator(globalClubData, 'receive', amount, balance, result.fullname, balanceCredit).then(
            (message) => (msg = message)
          );
        }
        this.dechargeAccount(userid, 'wallet', 500).then((res) => {
          if (res) {
            const title = 'هزینه ارسال پیامک';
            this.accountSetLoggClose(title, 'Service', 500, true, userid, null);
            SendAsanakSms(
              process.env.ASANAK_USERNAME,
              process.env.ASANAK_PASSWORD,
              process.env.ASANAK_NUMBER,
              '0' + result.mobile,
              msg
            ).then((res) => {
              console.log(res, 'sms account');
            });
          }
        });
      }
    });
  }

  async accountSetLoggClose(titlex, type, amount, status, from, to, mobile?): Promise<any> {
    const senderBalance = await this.getBalance(from, 'wallet').catch((err) => {
      console.log(err, 'receiveBalance');
    });
    const receiveBalance = await this.getBalance(to, 'wallet').catch((err) => {
      console.log(err, 'receiveBalance');
    });
    let tobalance,
      rebalance = 0;
    if (senderBalance) rebalance = senderBalance.balance;
    if (receiveBalance) tobalance = receiveBalance.balance;
    return this.loggerService.submitNewLogg(titlex, type, amount, status, from, to, tobalance, rebalance, mobile);
  }

  async getTodayCharge(userid: string): Promise<any> {
    return this.todayChargeService.getTodayTransAmount(userid);
  }

  async getTodayAuthorizePay(userid: string): Promise<any> {
    return this.todayChargeService.getTodayAuthorizePay(userid);
  }

  private async smsMessageGenerator(
    globalClubData: GlobalClubData,
    status: 'send' | 'receive',
    amount: number,
    balance: number,
    fullname: string,
    balanceCredit = ''
  ): Promise<string> {
    switch (status) {
      case 'send': {
        if (globalClubData.clubFound) {
          return this.generateClubSendMessage(globalClubData, amount, balance, fullname, balanceCredit);
        }
        return SendAccountBalanceMessage(fullname, amount, balance);
      }
      case 'receive': {
        if (globalClubData.clubFound) {
          return this.generateClubReceiveMessage(globalClubData, amount, balance, fullname, balanceCredit);
        }
        return ReciveAccountBalanceMessage(fullname, amount, balance);
      }
      default:
        throw new Error('Invalid status');
    }
  }

  async generateClubSendMessage(
    globalClubData: GlobalClubData,
    amount: number,
    balance: number,
    fullname: string,
    balanceCredit: string = ''
  ): Promise<string> {
    const message = balanceCredit
      ? globalClubData.clubName +
        '\n' +
        fullname +
        ' عزیز \n' +
        'کسر از کیف پول شما : ' +
        amount +
        'ریال' +
        '\n' +
        'مانده کیف پول : ' +
        balance +
        'ریال' +
        '\n' +
        'مانده اعتبار : ' +
        balanceCredit +
        'ریال' +
        '\n' +
        ' آدرس: ' +
        globalClubData.pwa +
        /* '\n' +
       'لینک اپلیکیشن: ' +
       globalClubData.androidApp +*/
        '\n' +
        '\n' +
        'تماس با پشتیبانی: ' +
        (globalClubData.tel.startsWith('0') ? globalClubData.tel : '0' + globalClubData.tel)
      : globalClubData.clubName +
        '\n' +
        fullname +
        ' عزیز \n' +
        'کسر از کیف پول شما : ' +
        amount +
        'ریال' +
        '\n' +
        'مانده کیف پول : ' +
        balance +
        'ریال' +
        '\n' +
        ' آدرس: ' +
        globalClubData.pwa +
        /* '\n' +
       'لینک اپلیکیشن: ' +
       globalClubData.androidApp +*/
        '\n' +
        '\n' +
        'تماس با پشتیبانی: ' +
        (globalClubData.tel.startsWith('0') ? globalClubData.tel : '0' + globalClubData.tel);
    return message;
  }

  async generateClubReceiveMessage(
    globalClubData: GlobalClubData,
    amount: number,
    balance: number,
    fullname: string,
    balanceCredit = ''
  ): Promise<string> {
    const message = balanceCredit
      ? globalClubData.clubName +
        '\n' +
        fullname +
        ' عزیز \n' +
        'شارژ موجودی شما : ' +
        amount +
        'ریال' +
        '\n' +
        'مانده کیف پول : ' +
        balance +
        'ریال' +
        '\n' +
        'مانده اعتبار : ' +
        balanceCredit +
        'ریال' +
        '\n' +
        ' آدرس: ' +
        globalClubData.pwa +
        /*  '\n' +
     'لینک اپلیکیشن: ' +
     globalClubData.androidApp +*/
        '\n' +
        '\n' +
        'تماس با پشتیبانی: ' +
        (globalClubData.tel.startsWith('0') ? globalClubData.tel : '0' + globalClubData.tel)
      : globalClubData.clubName +
        '\n' +
        fullname +
        ' عزیز \n' +
        'شارژ موجودی شما : ' +
        amount +
        'ریال' +
        '\n' +
        'مانده کیف پول : ' +
        balance +
        'ریال' +
        '\n' +
        ' آدرس: ' +
        globalClubData.pwa +
        /*  '\n' +
     'لینک اپلیکیشن: ' +
     globalClubData.androidApp +*/
        '\n' +
        '\n' +
        'تماس با پشتیبانی: ' +
        (globalClubData.tel.startsWith('0') ? globalClubData.tel : '0' + globalClubData.tel);
    return message;
  }
}
