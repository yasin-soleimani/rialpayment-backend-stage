import {
  BadGatewayException,
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@vision/common';
import { LoggercoreService } from '../../../../Core/logger/loggercore.service';
import { soap } from 'strong-soap';
import { AccountService } from '../../../../Core/useraccount/account/account.service';
import * as SamanStates from '../saman/saman.class';
import { ClubPwaService } from '../../../clubpwa/club-pwa.service';
import axios, { AxiosInstance } from 'axios';

export interface returnVerify {
  status: number;
  cardNumberMasked: string;
  rrn: string;
  token: string;
}

export interface retunrData {
  Token: string;
  OrderId: string;
  TerminalNo: string;
  RRN: string;
  status: string;
  TspToken: string;
  HashCardNumber: string;
  Amount: string;
  SwAmount: string;
  STraceNo: string;
}

@Injectable()
export class PardakhtNovinNewService {
  private RequestUrl = 'https://pna.shaparak.ir/ref-payment2/jax/merchantService?wsdl';
  client: AxiosInstance;

  constructor(
    @Inject('IpgModel') private readonly ipgModel: any,
    private readonly accountService: AccountService,
    private readonly loggerService: LoggercoreService,
    private readonly clubPwaService: ClubPwaService
  ) {
    this.client = axios.create({ baseURL: 'https://pna.shaparak.ir/' });
  }

  async NewReq(callbackurl, amount, username, password): Promise<any> {
    if (true) {
      console.log('in gway');
      const orederid = Date.now();

      const dataToken = {
        CorporationPin: password,
        Amount: amount,
        OrderId: orederid,
        CallBackUrl: callbackurl,
        AdditionalData: '',
        Originator: '',
      };
      console.log('in data', dataToken);

      try {
        const data = await this.client.post('mhipg/api/Payment/NormalSale', dataToken);
        console.log('res gway', data.data);
        return {
          token: data.data.token,
          type: 4,
          orderid: orederid,
        };
      } catch (e) {
        console.log('gway err:::::::::::: ', e?.response?.data ?? e);
        throw new BadRequestException('خطا در ارتباط با درگاه پرداخت');
      }
    } else {
      throw new BadRequestException('خطا در ارتباط با درگاه پرداخت');
    }
  }

  private async makeClient(): Promise<any> {
    return new Promise((resolve, reject) => {
      soap.createClient(this.RequestUrl, {}, function (err, client) {
        if (client) resolve(client);
      });
    });
  }

  private async login(username: string, password: string, client: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const args = {
        param: {
          UserName: username,
          Password: password,
        },
      };

      client.MerchantLogin(args, function (err, result, envelope, soapHeader) {
        if (result) resolve(result.return);
      });
    });
  }

  private async GenerateTransactionDataToSign(
    sessionId,
    username,
    password,
    callbackurl,
    amount,
    invoiceid,
    client
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const args2 = {
        param: {
          WSContext: {
            SessionId: sessionId,
            UserId: username,
            Password: password,
          },
          ReserveNum: invoiceid,
          Amount: amount,
          RedirectUrl: callbackurl,
          TransType: 'enGoods',
        },
      };

      client.GenerateTransactionDataToSign(args2, function (err, result, envelope, soapHeader) {
        if (result) resolve(result.return);
      });
    });
  }

  private async getValidateSign(sessionId, Signature, uniqueid, client, username, password): Promise<any> {
    return new Promise((resolve, reject) => {
      const args = {
        param: {
          WSContext: {
            SessionId: sessionId,
            UserId: username,
            Password: password,
          },
          Signature: Signature,
          UniqueId: uniqueid,
        },
      };
      console.log(args, '');
      client.GenerateSignedDataToken(args, function (err, result, envelope, soapHeader) {
        console.log(envelope, 'ev');
        if (result) resolve(result.return);
      });
    });
  }

  async verifyTrax(getInfo: retunrData, username, password): Promise<returnVerify> {
    const ipgData = await this.ipgModel.findOneAndUpdate({ token: getInfo.Token }, { $set: { trx: false } });

    if (ipgData.confirm == true) {
      return {
        rrn: getInfo.RRN,
        cardNumberMasked: '',
        status: -1,
        token: '',
      };
    }
    /*{
  Token: 'MTUyODQxOTQ2ODk3',
  OrderId: '1716974961625',
  TerminalNo: '30445920',
  RRN: '801171153411',
  status: '0',
  TspToken: '00000000-0000-0000-0000-000000000000',
  HashCardNumber: '870A27EE69A1AFABB2A3B0F42685C9CE96BDC54548FBB405E04BBD3DBD8A940E',
  Amount: '20,000',
  SwAmount: '',
  STraceNo: '378088'
}*/
    this.ipgModel.findOneAndUpdate({ token: getInfo.Token }, { $set: { confirm: true, $inc: { retry: 1 } } });

    return this.verify(getInfo, {}, {}, username, password);
  }
  // 0939-785-8355 Bahari CTO novin Arian
  private async verify(getInfo: retunrData, client, login, username, password): Promise<returnVerify> {
    try {
      const verifier = await this.client.post('mhipg/api/Payment/confirm', {
        CorporationPin: password,
        Token: getInfo.Token,
      });
      console.log('verify request data', verifier.data);
      if (verifier.data.status === 0) {
        return verifier.data;
      } else {
        return {
          rrn: getInfo.RRN ?? null,
          status: verifier.data.status,
          token: getInfo.Token ?? '',
          cardNumberMasked: '',
        };
      }
    } catch (e) {
      console.log('err verify pna', e?.response?.data ?? e);
      return {
        rrn: getInfo.RRN ?? null,
        status: -1,
        token: getInfo.Token ?? '',
        cardNumberMasked: '',
      };
    }
  }

  fixPan(cardno) {
    if (cardno) {
      const pan1 = cardno.substr(0, 6);
      const pan2 = cardno.substr(12);
      return pan1 + '******' + pan2;
    }
    return null;
  }

  async confirmTransaction(getInfo: retunrData): Promise<any> {
    console.log('pna callback data: ', getInfo);
    let state: any = getInfo.status;
    if (!state) {
      state = {
        code: -10,
        cause: 'عملیات با خطا مواجه شده است',
      };
    }
    const traxInfo = await this.ipgModel.findOne({ token: getInfo.Token, trx: false });
    if (!traxInfo) throw new InternalServerErrorException();

    const referer = JSON.parse(traxInfo.payload).referer;
    const clubPwaData = await this.clubPwaService.getClubPwaByReferer(referer);
    let clubPwaChargeCallback = clubPwaData ? clubPwaData.chargeCallback : '';
    if (traxInfo.devicetype === 'mobile') clubPwaChargeCallback = 'app://ir.mersad.rialpayment';
    if (!!traxInfo?.details?.cardnumber) {
      console.log('in prevent:::::::::::::::::::::::::::::');
      return { info: traxInfo, status: 'ok', clubPwaCallback: clubPwaChargeCallback };
    }
    await this.ipgModel.findOneAndUpdate({ token: getInfo.Token }, { $set: { trx: true } });

    if (getInfo.status == '0' && getInfo.Token) {
      //state ok
      const data = await this.verifyTrax(getInfo, traxInfo.terminalinfo.username, traxInfo.terminalinfo.password);
      console.log('data verify::::', data);
      if (data.status == 0) {
        /*const logInfo = await this.loggerService.findAndUpdate(traxInfo.invoiceid, true);
        if (!logInfo || logInfo.status == true) throw new InternalServerErrorException();*/
        console.log('data success return::::', data, getInfo, clubPwaChargeCallback);
        return this.confirmSuccess(data, getInfo, clubPwaChargeCallback);
      } else {
        if (data.status == -2508) {
          return this.confirmSuccess(data, getInfo, clubPwaChargeCallback, false);
        }
        return this.confirmFailed(getInfo, state, clubPwaChargeCallback);
      }
    } else {
      // failed
      return this.confirmFailed(getInfo, state, clubPwaChargeCallback);
    }
  }

  private async confirmSuccess(data: returnVerify, getInfo: retunrData, clubPwaCallback, update = true): Promise<any> {
    console.log('in confirm success', getInfo.RRN, data.rrn);
    const maskCard = this.fixPan(data.cardNumberMasked);
    console.log('after masked', maskCard);
    if (update) {
      const success = await this.ipgModel.findOneAndUpdate(
        { token: getInfo.Token },
        {
          $set: {
            status: 1,
            details: {
              rrn: getInfo.RRN,
              cardnumber: data.cardNumberMasked,
              respmsg: 'عملیات با موفقیت انجام شد',
              respcode: 0,
            },
          },
        },
        { new: true }
      );
      console.log('after success update', success);
      await this.accountService.chargeAccount(success.user._id, 'wallet', success.amount);
      console.log('after charge account');
      this.loggerService.findAndUpdate(success.invoiceid, true);
      return {
        info: success,
        status: 'ok',
        clubPwaCallback,
        details: {
          rrn: getInfo.RRN,
          cardnumber: data.cardNumberMasked,
          respmsg: 'عملیات با موفقیت انجام شد',
          respcode: 0,
        },
      };
    } else {
      const successData = await this.ipgModel.findOne({ token: getInfo.Token }).lean();
      console.log('in reverify data::::::::::::::::>>>>>>>>>');
      return {
        info: successData,
        status: 'ok',
        clubPwaCallback,
        details: successData?.details ?? {
          rrn: getInfo.RRN,
          cardnumber: data.cardNumberMasked,
          respmsg: 'عملیات با موفقیت انجام شد',
          respcode: 0,
        },
      };
    }
  }

  private async confirmFailed(getInfo: retunrData, state, clubPwaCallback: string): Promise<any> {
    //const maskCard = this.fixPan(getInfo.CardMaskPan);
    console.log('in confirm error');
    const failed = await this.ipgModel.findOneAndUpdate(
      { token: getInfo.Token },
      {
        $set: {
          status: 0,
          details: {
            rrn: getInfo.RRN ?? null,
            cardnumber: '',
            respmsg: 'خطا در انجام تراکنش درگاه',
            respcode: state,
          },
        },
      }
    );
    console.log('after update error', failed);

    const details = {
      respmsg: 'خطا در برقراری ارتباط با درگاه',
      respcode: state,
      cardnumber: failed?.details?.cardnumber ?? '',
      ref: failed?.userinvoice,
    };
    console.log('after details', details);

    return { info: failed, details: details, status: 'nok', clubPwaCallback };
  }
}
