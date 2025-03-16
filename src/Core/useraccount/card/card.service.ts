import { Model } from 'mongoose';
import { Injectable, Inject } from '@vision/common';
import { CreateCardDto } from './dto/create-card.dto';
import { CardcounterService } from '../cardcounter/cardcounter.service';
import * as securepin from 'secure-pin';
import * as luhn from 'cc-luhn';
import { isNull } from 'util';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { GeneralService } from '../../service/general.service';
import * as securePin from 'secure-pin';
import * as mongoose from 'mongoose';
import { CardTypeEnum } from '@vision/common/enums/card-opt.enum';
import { UserService } from '../user/user.service';

@Injectable()
export class CardService {
  constructor(
    @Inject('CardModel') private readonly cardModel: any,
    @Inject('CardHistoryModel') private readonly cardHistoryModel: any,
    private readonly cardcounterService: CardcounterService,
    private readonly generalService: GeneralService,
    private readonly userService: UserService
  ) {}

  private async create(createAuthDto: CreateCardDto): Promise<any> {
    const createdCard = new this.cardModel(createAuthDto);
    return createdCard.save();
  }

  async changePasswordWithUserid(userid, pass): Promise<any> {
    return this.cardModel.findOneAndUpdate({ user: userid }, { pin: pass });
  }

  async getCardInfoById(cardid: string): Promise<any> {
    return this.cardModel.findOne({ _id: cardid });
  }

  async getAll(): Promise<any> {
    return this.cardModel.find({ data: { $exists: false } });
  }

  async regitredAP(id, status, data): Promise<any> {
    return this.cardModel.findOneAndUpdate({ _id: id }, { registerd: status, data: data });
  }

  async active(id): Promise<any> {
    return this.cardModel.findOneAndUpdate({ _id: id }, { status: true });
  }

  async toggleStatus(cardno: string): Promise<any> {
    const card = await this.cardModel.findOne({ cardno: parseInt(cardno) });
    if (!card) throw new UserCustomException('کارت یافت نشد');
    card.status = !card.status;
    return card.save();
  }

  async updatePin(id, pin): Promise<any> {
    return this.cardModel.findOneAndUpdate({ _id: id }, { pin: pin });
  }

  async setUser(id: string, user: string): Promise<any> {
    return this.cardModel.findOneAndUpdate(
      { _id: id },
      {
        $unset: { owner: 1, type: 1, group: 1 },
        user: user,
      }
    );
  }

  // Generate Card
  async generateCard(user: string) {
    await this.cardcounterService.getNumbersCards().then(async (value) => {
      // make card
      const chksum = luhn(value.seq.toString());
      const newcard = value.seq + chksum;

      let pin;
      const userInfo = await this.userService.getInfoByUserid(user);
      const mobile = userInfo.mobile.toString();
      pin = mobile.substr(mobile.length - 4, mobile.length);
      // make expire date
      const now = new Date();
      const oneYr = new Date();
      const fullyear = oneYr.setFullYear(now.getFullYear() + 5);

      // make cvv2
      const cvv2 = securepin.generatePinSync(4);
      const params = CardService.toParams(newcard, fullyear, cvv2, user, pin);

      // save in database
      return this.create(params);
    });
  }

  async getLastCard(): Promise<any> {
    return this.cardModel.findOne({}).sort({ createdAt: -1 });
  }
  async genGiftCard(ownerid, group): Promise<any> {
    return this.cardcounterService.getNumbersCards().then((cardNumber) => {
      const chksum = luhn(cardNumber.seq.toString());
      const cardno = cardNumber.seq + chksum;

      const pin = cardno.toString().substr(12);
      const secpin = securepin.generatePinSync(4);

      // make expire date
      const now = new Date();
      const oneYr = new Date();
      const fullyear = oneYr.setFullYear(now.getFullYear() + 5);

      // make cvv2
      const cvv2 = securepin.generatePinSync(4);
      return this.cardModel.insertMany({
        cardno: cardno,
        pin: pin,
        secpin: secpin,
        status: true,
        type: CardTypeEnum.Gift,
        cvv2: cvv2,
        expire: fullyear,
        owner: ownerid,
        group: group,
      });
    });
  }

  async getGiftCardList(userid, page): Promise<any> {
    let ObjID = mongoose.Types.ObjectId;
    let aggregate = this.cardModel.aggregate();
    aggregate.match({
      owner: ObjID(userid),
    });
    var options = { page: page, limit: 50 };

    return this.cardModel.aggregatePaginate(aggregate, options);
  }

  async getGiftCardListWithGroup(userid, page, groupid): Promise<any> {
    let ObjID = mongoose.Types.ObjectId;
    let aggregate = this.cardModel.aggregate();
    aggregate.match({
      owner: ObjID(userid),
      group: ObjID(groupid),
    });
    aggregate.project({
      cardno: 1,
      pin: 1,
      secpin: 1,
      createdAt: 1,
    });
    var options = { page: page, limit: 50 };

    return this.cardModel.aggregatePaginate(aggregate, options);
  }

  async getCardInfo(cardnox): Promise<any> {
    return this.cardModel.findOne({ cardno: cardnox }).populate('user');
  }

  async getCardInfoByCardNoAndRefId(cardno: number, refid: string): Promise<any> {
    return this.cardModel.findOne({ cardno: cardno, owner: refid }).populate('user');
  }

  async getCardByUserID(userid): Promise<any> {
    return this.cardModel.findOne({ user: userid });
  }

  async getAllUsersCard(userid: string): Promise<any> {
    return this.cardModel.find({ user: userid });
  }

  async getAllCardsByUserid(userid: string): Promise<any> {
    return this.cardModel.find({ user: userid }).populate('user');
  }

  async getStatus(userid): Promise<any> {
    if (isEmpty(userid)) throw new UserCustomException('دسترسی به کارت مورد نظر مقدور نمی باشد', false, 401);
    const data = await this.cardModel.findOne({ user: userid });
    if (!data) throw new UserCustomException('دسترسی به کارت مورد نظر مقدور نمی باشد', false, 401);
    let status = false;
    if (!isEmpty(data.status)) {
      status = data.status;
    }
    let firstPass = true;
    if (!isEmpty(data.pin)) firstPass = false;
    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      data: {
        cardno: data.cardno,
        status: data.status,
        firstpass: firstPass,
      },
    };
  }

  async changeStatus(cardnox, statusx, userid, pin?): Promise<any> {
    const data = await this.cardModel.findOne({ $and: [{ cardno: cardnox }, { user: userid }] });
    if (!data) throw new UserCustomException('دسترسی به کارت مورد نظر مقدور نمی باشد', false, 401);
    if (data.pin !== pin) throw new UserCustomException('رمز کارت صحیح نمی باشد', false, 300);
    let status = false;
    if (statusx == 'true' || statusx == true) {
      status = true;
    }
    const newdata = await this.cardModel.findOneAndUpdate(
      { $and: [{ cardno: cardnox }, { user: userid }] },
      { $set: { status: status } }
    );
    if (!newdata) throw new UserCustomException('خطایی در عملیات رخ داده است', false, 500);
    return this.successOpt();
  }

  async changePW(cardnox, newpin, userid, pin?): Promise<any> {
    const data = await this.cardModel.findOne({ $and: [{ cardno: cardnox }, { user: userid }] });
    if (isNull(data)) throw new UserCustomException('دسترسی به کارت مورد نظر مقدور نمی باشد', false, 401);
    if (!isEmpty(data.pin)) {
      if (data.pin !== pin) throw new UserCustomException('رمز کارت صحیح نمی باشد', false, 300);
      if (newpin.length !== 4) throw new UserCustomException('رمز کارت باید 4 کاراکتر باشد', false, 202);

      const cards = await this.cardModel.find({ user: userid });
      for (const info of cards) {
        await this.cardModel.findOneAndUpdate({ _id: info._id }, { pin: newpin });
      }
      return this.successOpt();
    } else {
      if (newpin.length !== 4) throw new UserCustomException('رمز کارت باید 4 کاراکتر باشد', false, 202);
      const cards = await this.cardModel.find({ user: userid });
      for (const info of cards) {
        await this.cardModel.findOneAndUpdate({ _id: info._id }, { pin: newpin });
      }
      return this.successOpt();
    }
  }

  async changeCardno(userid, lastcardno, cardno): Promise<any> {
    return this.cardModel.findOneAndUpdate({ user: userid, cardno: lastcardno }, { cardno: cardno });
  }

  async changeCardAdmin(oldCard, newCard): Promise<any> {
    return this.cardModel.findOneAndUpdate(
      {
        cardno: oldCard,
      },
      {
        cardno: newCard,
      }
    );
  }

  async changeStatusAdmin(card: number, status: boolean): Promise<any> {
    return this.cardModel.findOneAndUpdate(
      {
        cardno: card,
      },
      {
        status: status,
      }
    );
  }

  async changeSecpinAdmin(card: number, secpin): Promise<any> {
    return this.cardModel.findOneAndUpdate(
      {
        cardno: card,
      },
      {}
    );
  }

  async changePasswordAdmin(card, password): Promise<any> {
    return this.cardModel.findOneAndUpdate(
      {
        cardno: card,
      },
      {
        pin: password,
      }
    );
  }

  async changeCard(cardno: number, userid: string, owner: string): Promise<any> {
    return this.cardModel.findOneAndUpdate(
      {
        cardno: cardno,
        owner: owner,
      },
      {
        $unset: { owner: 1, type: 1, group: 1 },
        user: userid,
      }
    );
  }

  async unsetUserCard(userid: string): Promise<any> {
    return this.cardModel.findOneAndUpdate(
      {
        user: userid,
      },
      {
        $unset: { user: 1 },
      }
    );
  }

  async unsetUserCardByCardno(cardno: number): Promise<any> {
    return this.cardModel.findOneAndUpdate(
      {
        cardno: cardno,
      },
      {
        $unset: { user: 1 },
      }
    );
  }

  async chargeCard(id: string, amount: number): Promise<any> {
    return this.cardModel.findOneAndUpdate({ _id: id }, { $inc: { amount: amount } });
  }

  async sendVerify(cardnum, userid): Promise<any> {
    const data = await this.getInfocard(cardnum, userid);
    if (isNull(data)) throw new UserCustomException('دسترسی به کارت مورد نظر مقدور نمی باشد', false, 401);
    const randno = securePin.generatePinSync(4);
    const msgBody = 'کد تغییر رمز کارت شما : ' + randno;
    const msg = await this.cardModel.findOneAndUpdate(
      { $and: [{ cardno: cardnum }, { user: userid }] },
      { code: randno }
    );
    const mobile = '0' + data.user.mobile;
    this.generalService.AsanaksendSMS(
      process.env.ASANAK_USERNAME,
      process.env.ASANAK_PASSWORD,
      process.env.ASANAK_NUMBER,
      mobile,
      msgBody
    );
    return this.successOpt();
  }

  async checkcode(code, userid): Promise<any> {
    const data = await this.cardModel.findOne({ user: userid });
    if (!data) throw new UserCustomException('اطلاعات وارد شده معتبر نمی باشد', false, 404);
    if (code === data.code) {
      return this.successOpt();
    } else {
      return this.faild();
    }
  }

  async getInfoBySerial(serialno: string): Promise<any> {
    return this.cardModel.findOne({
      serial: serialno,
    });
  }

  async setSerial(cardno: number, serial: string): Promise<any> {
    return this.cardModel.findOneAndUpdate(
      {
        cardno: cardno,
      },
      {
        $set: {
          serial: serial,
        },
      }
    );
  }

  async activate(code, password, userid): Promise<any> {
    const data = await this.cardModel.find({ user: userid });
    if (!data || data.length < 1) throw new UserCustomException('اطلاعات وارد شده معتبر نمی باشد', false, 404);

    for (const info of data) {
      if (code === info.code) {
        await this.cardModel.findOneAndUpdate({ cardno: info.cardno }, { code: '', pin: password });
      } else {
        throw new UserCustomException('کد اشتباه می باشد ');
      }
    }
    return this.successOpt();
  }

  async newActivate(password, userid): Promise<any> {
    const data = await this.cardModel.find({ user: userid });
    if (!data || data.length < 1) throw new UserCustomException('اطلاعات وارد شده معتبر نمی باشد', false, 404);
    for (const info of data) {
      await this.cardModel.findOneAndUpdate({ cardno: info.cardno }, { code: '', pin: password });
    }
    return this.successOpt();
  }

  async dechargeAmount(id: string, amount): Promise<any> {
    return this.cardModel.findOneAndUpdate({ _id: id }, { $inc: { amount: -amount } });
  }

  async getInfocard(cardnum, userid): Promise<any> {
    return await this.cardModel.findOne({ $and: [{ cardno: cardnum }, { user: userid }] }).populate('user');
  }

  private static toParams(cardnox, expirex, cvv2x, userx, pin) {
    return {
      user: userx,
      cardno: cardnox,
      expire: expirex,
      cvv2: cvv2x,
      pin: pin,
    };
  }

  private toParamsGiftcard(cardno, expire, cvv2, owner) {
    return {};
  }

  async generateCardBulk(user): Promise<any> {
    await this.cardcounterService.getNumbersCards().then(async (value) => {
      // make card
      const chksum = luhn(value.seq.toString());
      const newcard = value.seq + chksum;

      let pin;
      const userInfo = await this.userService.getInfoByUserid(user);
      const mobile = userInfo.mobile.toString();
      pin = mobile.substr(mobile.length - 4, mobile.length);
      //      pin = userInfo.mobile.substr( mobile.length - 4 );
      // make expire date
      const now = new Date();
      const oneYr = new Date();
      const fullyear = oneYr.setFullYear(now.getFullYear() + 5);

      // make cvv2
      const cvv2 = securepin.generatePinSync(4);
      const params = CardService.toParams(newcard, fullyear, cvv2, user, pin);

      // save in database
      const cardInfo = await this.cardModel.insertMany(params, { ordered: false });
    });
  }

  async getAllByGroupAndChangePw(groupid): Promise<any> {
    const data = await this.cardModel.find({ group: groupid });
    if (!data) return false;
    for (let i = 0; data.length > i; i++) {
      const pin = data[i].cardno.toString().substr(12);
      this.updatePin(data[i]._id, pin).then((res) => {
        console.log(res);
      });
    }
  }

  async getCardsGroup(groupid): Promise<any> {
    return this.cardModel.find({
      group: groupid,
    });
  }

  async getCardGroupList(userid: string, page: number, groupid: string): Promise<any> {
    return this.cardModel.paginate(
      { group: groupid },
      { populate: { path: 'user' }, page, lean: false, sort: { createdAt: -1 }, limit: 50 }
    );
  }

  async setLog(user, type, opt, amount?, secpin?, ref?): Promise<any> {
    return this.cardHistoryModel.create({
      user: user,
      type: type,
      opt: opt,
      amount: amount,
      secpin: secpin,
      ref: ref,
    });
  }
  async genSecPin(id): Promise<any> {
    const secpin = securepin.generatePinSync(4);

    return this.cardModel.findOneAndUpdate({ _id: id }, { $set: { secpin: secpin } }).exec();
  }

  private successOpt() {
    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
    };
  }

  private faild() {
    return {
      status: 305,
      success: false,
      message: 'کد وارد شده صحیح نمی باشد',
    };
  }
}
