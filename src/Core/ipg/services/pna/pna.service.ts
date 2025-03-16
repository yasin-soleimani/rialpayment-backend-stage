import { Inject, Injectable, InternalServerErrorException } from '@vision/common';
import { LoggercoreService } from '../../../../Core/logger/loggercore.service';
import { soap } from 'strong-soap';
import { AccountService } from '../../../../Core/useraccount/account/account.service';
import * as SamanStates from '../saman/saman.class';
import { ClubPwaService } from '../../../clubpwa/club-pwa.service';

@Injectable()
export class PardakhtNovinService {
  private RequestUrl = 'https://pna.shaparak.ir/ref-payment2/jax/merchantService?wsdl';

  constructor(
    @Inject('IpgModel') private readonly ipgModel: any,
    private readonly accountService: AccountService,
    private readonly loggerService: LoggercoreService,
    private readonly clubPwaService: ClubPwaService
  ) {}

  async NewReq(callbackurl, amount, username, password): Promise<any> {
    const client = await this.makeClient();
    const login = await this.login(username, password, client);
    if (login.Result == 'erSucceed') {
      const orederid = Date.now();
      const data = await this.GenerateTransactionDataToSign(
        login.SessionId,
        username,
        password,
        callbackurl,
        amount,
        orederid,
        client
      );
      const compared = await this.getValidateSign(
        login.SessionId,
        data.DataToSign,
        data.UniqueId,
        client,
        username,
        password
      );
      if (compared.Result == 'erSucceed' && compared.Token) {
        return {
          token: compared.Token,
          type: 4,
          orderid: orederid,
        };
      }
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

  async verifyTrax(getInfo, username, password): Promise<any> {
    const ipgData = await this.ipgModel.findOneAndUpdate({ token: getInfo.token }, { $set: { trx: false } });

    if (ipgData.confirm == true) {
      return {
        Result: 'erFaild',
        Amount: 0,
        RefNum: '',
      };
    }
    this.ipgModel.findOneAndUpdate({ token: getInfo.token }, { $set: { confirm: true, $inc: { retry: 1 } } });

    const client = await this.makeClient();
    const login = await this.login(username, password, client);

    if (login.Result == 'erSucceed') {
      return this.verify(getInfo, client, login, username, password);
    } else {
      return {
        Result: 'erFaild',
        Amount: 0,
        RefNum: '',
      };
    }
  }
  // 0939-785-8355 Bahari CTO novin Arian
  private async verify(getInfo, client, login, username, password): Promise<any> {
    return new Promise((resolve, reject) => {
      const args = {
        param: {
          WSContext: {
            SessionId: login.SessionId,
            UserId: username,
            Password: password,
          },
          Token: getInfo.token,
          RefNum: getInfo.RefNum,
        },
      };
      console.log(args, '');
      client.VerifyMerchantTrans(args, function (err, result, envelope, soapHeader) {
        if (result) resolve(result.return);
      });
    });
  }

  fixPan(cardno) {
    if (cardno) {
      const pan1 = cardno.substr(0, 6);
      const pan2 = cardno.substr(12);
      return pan1 + '******' + pan2;
    }
    return null;
  }

  async confirmTransaction(getInfo): Promise<any> {
    let state = SamanStates[getInfo.State];
    if (!state) {
      state = {
        code: -10,
        cause: 'عملیات با خطا مواجه شده است',
      };
    }
    const traxInfo = await this.ipgModel.findOne({ token: getInfo.token, trx: false });
    if (!traxInfo) throw new InternalServerErrorException();

    const referer = JSON.parse(traxInfo.payload).referer;
    const clubPwaData = await this.clubPwaService.getClubPwaByReferer(referer);
    let clubPwaChargeCallback = clubPwaData ? clubPwaData.chargeCallback : '';
    if (traxInfo.devicetype === 'mobile') clubPwaChargeCallback = 'app://ir.mersad.rialpayment';
    await this.ipgModel.findOneAndUpdate({ token: getInfo.token }, { $set: { trx: true } });

    if (getInfo.State == 'OK' && getInfo.token) {
      //state ok
      const data = await this.verifyTrax(getInfo, traxInfo.terminalinfo.username, traxInfo.terminalinfo.password);
      if (data.Result == 'erSucceed') {
        const logInfo = await this.loggerService.findAndUpdate(traxInfo.invoiceid, true);

        if (!logInfo || logInfo.status == true) throw new InternalServerErrorException();

        return this.confirmSuccess(data, getInfo, clubPwaChargeCallback);
      } else {
        return this.confirmFailed(getInfo, state, clubPwaChargeCallback);
      }
    } else {
      // failed
      return this.confirmFailed(getInfo, state, clubPwaChargeCallback);
    }
  }

  private async confirmSuccess(data, getInfo, clubPwaCallback): Promise<any> {
    const maskCard = this.fixPan(getInfo.CardMaskPan);
    const success = await this.ipgModel.findOneAndUpdate(
      { token: getInfo.token },
      {
        $set: {
          status: 1,
          details: {
            rrn: getInfo.CustomerRefNum,
            cardnumber: maskCard,
            respmsg: 'عملیات با موفقیت انجام شد',
            respcode: 0,
          },
        },
      }
    );

    this.accountService.chargeAccount(success.user._id, 'wallet', success.amount);
    this.loggerService.findAndUpdate(success.invoiceid, true);
    return { info: success, status: 'ok', clubPwaCallback };
  }

  private async confirmFailed(getInfo, state, clubPwaCallback: string): Promise<any> {
    const maskCard = this.fixPan(getInfo.CardMaskPan);
    const failed = await this.ipgModel.findOneAndUpdate(
      { token: getInfo.token },
      {
        $set: {
          status: 0,
          details: {
            rrn: getInfo.CustomerRefNum,
            cardnumber: maskCard,
            respmsg: state.cause,
            respcode: state.code,
          },
        },
      }
    );

    const details = {
      respmsg: state.cause,
      respcode: state.code,
      cardnumber: failed.details.cardnumber,
      ref: failed.userinvoice,
    };
    return { info: failed, details: details, status: 'nok', clubPwaCallback };
  }
}
