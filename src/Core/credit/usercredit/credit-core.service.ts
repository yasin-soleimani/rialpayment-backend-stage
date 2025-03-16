import { Injectable, Inject, CreditChargeStatusEnums, faildOpt, CreditStatusEnums } from '@vision/common';
import { Model, Types } from 'mongoose';
import {
  monthDiff,
  timeConverter,
  todayDay,
  getMonthDateRange,
  setDateMonth,
  todayRange,
  addMonthJalali,
} from '@vision/common/utils/month-diff.util';
import { AccountService } from '../../useraccount/account/account.service';
import { successOpt } from '@vision/common/messages/success';
import * as UniqueNumber from 'unique-number';
import { LoggercoreService } from '../../logger/loggercore.service';
import { GeneralService } from '../../service/general.service';
import { UserService } from '../../useraccount/user/user.service';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { ChargeCreditSendMessage } from '@vision/common/messages/SMS';
import { roundFloor } from '@vision/common/utils/round.util';

@Injectable()
export class UserCreditCoreService {
  constructor(
    @Inject('UserCreditModel') private readonly userCreditModel: any,
    private readonly accountService: AccountService,
    private readonly loggerService: LoggercoreService,
    private readonly generalService: GeneralService,
    private readonly userService: UserService
  ) {}

  async signleChargeUserCredit(user, amount: any, date, type, chargerid?): Promise<any> {
    this.userCreditModel
      .findOneAndUpdate(
        { $and: [{ user: user }, { expire: date }, { type: type }] },
        { $set: { user: user, expire: date, from: chargerid, type: type } },
        { new: true, upsert: true }
      )
      .then((datas) => {
        this.userCreditModel
          .findOneAndUpdate({ $and: [{ user: user }, { expire: date }, { type: type }] }, { $inc: { amount: amount } })
          .then((dataz) => {});
      });
  }

  async chergeTransferPay(user, amount, date, type, chargerid?): Promise<any> {
    return this.userCreditModel.create({ user: user, expire: date, from: chargerid, type: type, amount: amount });
  }
  async chargeUserCredit(user, amount, start: any, months, type, chargerid?): Promise<any> {
    if (months > 36) console.log('error');
    const userData = await this.userService.findById(user);
    if (!user) throw new UserNotfoundException();
    const date1 = new Date(start * 1000).getTime();
    const date = setDateMonth(date1, months) * 1000;
    const dates = monthDiff(timeConverter(date1 / 1000), timeConverter(date / 1000));
    console.log(dates);
    const perMonth = amount / months;
    for (let i = 0; i < months; i++) {
      let value;
      if (i === 0) {
        value = new Date();
      } else {
        value = addMonthJalali(i);
      }
      this.userCreditModel
        .findOneAndUpdate(
          { $and: [{ user: user }, { expire: value }, { type: type }] },
          { $set: { user: user, expire: value, from: chargerid, type: type } },
          { new: true, upsert: true }
        )
        .then((datas) => {
          this.userCreditModel
            .findOneAndUpdate(
              { $and: [{ user: user }, { expire: value }, { type: type }] },
              { $inc: { amount: perMonth } }
            )
            .then((dataz) => {
              console.log('ok');
            });
        });
    }

    const title = 'شارژ اعتباری به مدت ' + months + ' ماه';
    const uniqueNumber = new UniqueNumber(true);
    const ref = 'CreditCharge-' + uniqueNumber.generate();
    const log = this.loggerService.setLogg(title, ref, amount, true, user, user);
    this.loggerService.newLogg(log);
    const creditBalance = await this.accountService.getBalance(user, 'credit');
    const Message = ChargeCreditSendMessage(months, roundFloor(perMonth), creditBalance.balance, userData.fullname);
    this.generalService.AsanaksendSMS(
      process.env.ASANAK_USERNAME,
      process.env.ASANAK_PASSWORD,
      process.env.ASANAK_NUMBER,
      '0' + userData.mobile,
      Message
    );
    return successOpt();
  }

  async deChargeUserCredit(user, amount, type, date): Promise<any> {
    const userDate = new Date(date);
    const dataDate = getMonthDateRange(userDate.getFullYear(), userDate.getMonth());

    this.userCreditModel
      .findOneAndUpdate(
        {
          $and: [{ user: user }, { type: type }, { expire: { $gte: dataDate.start, $lte: dataDate.end } }],
        },
        { $inc: { amount: -amount } }
      )
      .then((dataz) => {
        console.log(dataz);
      });
  }

  async getUserCredit(user, date): Promise<any> {
    const userDate = new Date(date);
    console.log(userDate);
    console.log(userDate.getFullYear(), 'userDate.getFullYear()');
    const dataDate = getMonthDateRange(userDate.getFullYear(), userDate.getMonth() + 1);
    console.log(dataDate, 'dataDate');

    return this.userCreditModel.findOne({
      $and: [
        { type: CreditChargeStatusEnums.Transferable },
        { user: user },
        { expire: { $gte: dataDate.start, $lte: dataDate.end } },
      ],
    });
  }

  async getCreditBalance(userid: string): Promise<any> {
    const date = todayRange();
    let ObjID = Types.ObjectId;
    let aggregate = this.userCreditModel.aggregate();

    aggregate.match({
      user: ObjID(userid),
      type: CreditChargeStatusEnums.Transferable,
      expire: { $gte: new Date(date.start) },
    });

    aggregate.group({
      _id: null,
      balance: { $sum: '$amount' },
    });

    return aggregate;
  }

  async singleDechargeWithDate(id, amount): Promise<any> {
    return this.userCreditModel.findOneAndUpdate({ _id: id }, { $inc: { amount: -amount } });
  }
  async singleDechargeUserCredit(user, date, amount): Promise<any> {
    const userDate = new Date(date);
    const dataDate = getMonthDateRange(userDate.getFullYear(), userDate.getMonth());

    return this.userCreditModel
      .findOneAndUpdate(
        {
          $and: [
            { type: CreditChargeStatusEnums.Transferable },
            { user: user },
            { expire: { $gte: dataDate.start, $lte: dataDate.end } },
          ],
        },
        { $inc: { amount: -amount } }
      )
      .then((res) => {
        return res;
      });
  }
}
