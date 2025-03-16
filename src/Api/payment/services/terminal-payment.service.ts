import {
  Injectable,
  successOpt,
  successOptWithDataNoValidation,
  faildOpt,
  InternalServerErrorException,
  BadRequestException,
} from '@vision/common';
import { PaymentDto } from '../dto/payment.dto';
import { MerchantCoreTerminalService } from '../../../Core/merchant/services/merchant-terminal.service';
import { CardService } from '../../../Core/useraccount/card/card.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { SwitchFormatter, SwitchReturn } from '@vision/common/formatter/switch.format';
import { TerminalType } from '@vision/common/enums/terminalType.enum';
import { now } from '@vision/common/utils/month-diff.util';
import { SwitchService } from '../../../Switch/next-generation/switch.service';
import { SwitchMessages } from '@vision/common/constants/switch-messages.const';
import { PspverifyCoreService } from '../../../Core/psp/pspverify/pspverifyCore.service';
import { LoggercoreService } from '../../../Core/logger/loggercore.service';
import { CardcounterService } from '../../../Core/useraccount/cardcounter/cardcounter.service';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { UserNotfoundException } from '@vision/common/exceptions/user-notfound.exception';
import { MerchantTerminalPosInfoService } from '../../../Core/merchant/services/merchant-terminal-pos-info.service';
import { PosSuccess } from '../../../Service/pos/function/switch-response.function';
import { sendSocketMessage } from '@vision/common/notify/socket.util';
import axios from 'axios';
import * as qs from 'querystring';
import { Schema } from 'mongoose';
import { generateRandomChar } from '@vision/common/services/generate-random-char.service';
import { TicketsService } from '../../../Service/tickets/ticket.service';

@Injectable()
export class TerminalPaymentService {
  constructor(
    private readonly terminalService: MerchantCoreTerminalService,
    private readonly cardService: CardService,
    private readonly switchService: SwitchService,
    private readonly pspVerifyService: PspverifyCoreService,
    private readonly loggerService: LoggercoreService,
    private readonly counterService: CardcounterService,
    private readonly userService: UserService,
    private readonly posInfoSevrice: MerchantTerminalPosInfoService,
    private readonly ticketsService: TicketsService
  ) {}

  async pay(getInfo: PaymentDto, userid): Promise<any> {
    const user = await this.userService.findUserAll(userid);
    console.log('userPayment user:::::::::::');
    if (!user) throw new UserNotfoundException();
    console.log('after not found::::::::::::');
    if (user.block == true) throw new UserCustomException('متاسفانه حساب شما مسدود شده است با پشتیبانی تماس بگیرید');
    console.log('after block::::::::::::');
    // check terminal Info
    const terminalInfo = await this.terminalService.getInfoByID(getInfo._id);
    if (!terminalInfo) throw new UserCustomException('پذیرنده نامعتبر', false, 404);
    console.log('after terminal::::::::::::');
    // check Card
    const cardInfo = await this.cardService.getCardByUserID(userid);
    if (!cardInfo) throw new UserCustomException('کارت نامعتبر', false, 404);
    console.log('after card::::::::::::');
    if (cardInfo.status != null && cardInfo.status === false) throw new BadRequestException('کارت غیرفعال است');
    console.log('after card deactive::::::::::::');
    const trk2 = cardInfo.cardno + '=' + cardInfo.secpin;
    const TraxID = await this.counterService.getTranxID();
    const switchData = SwitchFormatter(
      TraxID.traxid,
      cardInfo.cardno,
      104,
      terminalInfo.merchant.merchantcode,
      getInfo.pin,
      TerminalType.Mobile,
      terminalInfo.terminalid,
      trk2,
      getInfo.amount,
      new Date()
    );
    const confirm = SwitchFormatter(
      TraxID.traxid,
      cardInfo.cardno,
      106,
      terminalInfo.merchant.merchantcode,
      getInfo.pin,
      TerminalType.Mobile,
      terminalInfo.terminalid,
      trk2,
      getInfo.amount,
      new Date()
    );

    const posInfo = await this.posInfoSevrice.getInfoByTerminal(getInfo._id);
    console.log('after pos info::::::::::::');
    const res = await this.switchService.action(switchData);
    console.log('after action::::::::::::');
    return this.sync(res, terminalInfo.merchant.title, confirm, posInfo);
  }

  async payTicket(getInfo: PaymentDto, userid) {
    const user = await this.userService.findUserAll(userid);
    if (!user) throw new UserNotfoundException();
    if (user.block == true) throw new UserCustomException('متاسفانه حساب شما مسدود شده است با پشتیبانی تماس بگیرید');

    // check terminal Info
    const terminalInfo = await this.terminalService.getInfoByID(getInfo._id);
    if (!terminalInfo) throw new UserCustomException('پذیرنده نامعتبر', false, 404);

    // check Card
    const cardInfo = await this.cardService.getCardByUserID(userid);
    if (!cardInfo) throw new UserCustomException('کارت نامعتبر', false, 404);

    const posInfo = await this.posInfoSevrice.getInfoByTerminal(getInfo._id);

    const pay = await this.ticketsService.payTicket({
      mac: posInfo.mac,
      cardno: cardInfo.cardno,
      amount: 1,
      pin: '',
      payid: '',
      merchantcode: 1,
      secpin: '',
      serial: 1,
      terminalid: 1,
      track2: '',
      type: 1,
    });
    const res = {
      TrnAmt: 1,
      ReceiveDT: new Date(),
      TraxID: generateRandomChar(10),
      CardNum: cardInfo.cardno,
      Data: [{ remainCount: pay.data.remainCount }],
    };
    const msg = PosSuccess(res, 'پرداخت موفق');
    sendSocketMessage(
      posInfo.clientid,
      JSON.stringify({
        status: 200,
        success: true,
        message: 'خرید موفق تیکت',
        data: {
          remainCount: pay.data.remainCount,
          totalCount: pay.data.totalCount,
          expire: pay.data.expire,
          terminalTitle: pay.data.terminalTitle,
        },
      })
    ).catch((e) => console.log('send socket message error: ', e));
    this.sendTcpSocketMessage(posInfo.clientid, JSON.stringify(msg));
    console.log('pay::::::::::::;', msg);
    return successOptWithDataNoValidation(pay);
  }

  private async sync(resault, title, confirm, posInfo): Promise<any> {
    switch (resault.rsCode) {
      case SwitchMessages.cardExpired: {
        throw new UserCustomException('تاریخ انتقضا کارت به پایان رسیده است', false, 500);
        break;
      }

      case SwitchMessages.disableTerminal: {
        throw new UserCustomException('پذیرنده نامعتبر', false, 500);
        break;
      }

      case SwitchMessages.internalError: {
        throw new UserCustomException('خطای داخلی', false, 500);
        break;
      }

      case SwitchMessages.invalidAccount: {
        throw new UserCustomException('حساب نا معتبر', false, 500);
      }

      case SwitchMessages.invalidCardNumber: {
        throw new UserCustomException('کارت نامعبر', false, 500);
        break;
      }

      case SwitchMessages.invalidMerchant: {
        throw new UserCustomException('پذیرنده نامعتبر', false, 500);
        break;
      }

      case SwitchMessages.invalidPin: {
        throw new UserCustomException('رمز کارت اشتباه است', false, 500);
        break;
      }

      case SwitchMessages.notEnoughMoney: {
        throw new UserCustomException('موجودی ناکافی', false, 500);
        break;
      }

      case SwitchMessages.success: {
        return await this.success(resault, title, confirm, posInfo);
        break;
      }

      default: {
        throw new UserCustomException('خطای داخلی', false, 500);
        break;
      }
    }
  }

  private async success(res, title, confirm, posInfo): Promise<any> {
    const terminalInfo = await this.terminalService.getTerminalInfoByTerminalid(confirm.TermID);

    const confirmData = await this.switchService.action(confirm);
    console.log('confirmData:::', confirmData);
    if (!confirmData) throw new InternalServerErrorException();

    const traxInfo = await this.pspVerifyService.findByTraxID(confirm.TraxID, terminalInfo._id);
    if (!traxInfo) throw new UserCustomException('تراکنش یافت نشد');
    console.log('inSuccess--------------------------->');

    const json = JSON.parse(traxInfo.reqin);
    if (confirmData.rsCode == 17) {
      console.log('inRsCode17 --------------------------->');
      const logInfo = await this.loggerService.findByID(traxInfo.log);
      if (!logInfo) throw new UserCustomException('تراکنش یافت نشد', false);
      console.log(posInfo);
      if (posInfo) {
        if (posInfo.clientid) {
          console.log('inClientId--------------------------->');
          const msg = PosSuccess(res, 'پرداخت موفق');
          sendSocketMessage(posInfo.clientid, JSON.stringify(msg)).catch((e) =>
            console.log('send socket message error: ', e)
          );
          this.sendTcpSocketMessage(posInfo.clientid, JSON.stringify(msg));
        }
      }
      return successOptWithDataNoValidation(
        SwitchReturn(confirm.CardNum, title, confirm.TrnAmt, logInfo.ref, res.Data, json.ReceiveDT)
      );
    } else {
      throw new UserCustomException('تراکنش با خطا مواجه شده است');
    }
  }

  async sendTcpSocketMessage(cardInfo, message) {
    console.log('inTCPTerminal--------------------------->');
    axios.defaults.baseURL = process.env.SOCKET_TCP_SERVICE_URL.startsWith('http')
      ? process.env.SOCKET_TCP_SERVICE_URL
      : 'https://' + process.env.SOCKET_TCP_SERVICE_URL;
    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    const args = qs.stringify({
      clientid: cardInfo,
      message: message,
    });
    const dataTcp = await axios.post('all/', args);
    console.log('DataTCP::::::::::', dataTcp);
  }
}
