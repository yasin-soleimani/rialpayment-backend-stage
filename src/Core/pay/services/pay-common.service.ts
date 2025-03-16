import { Injectable } from '@vision/common';
import { PspverifyCoreService } from '../../psp/pspverify/pspverifyCore.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { AccountService } from '../../useraccount/account/account.service';
import {
  RequestTrans,
  ReqMainTrans,
  ReqDiscountTrans,
  ReqCreditHistoryTrans,
  ReqInstallsTRans,
} from '@vision/common/transform/payment.transform';
import { CreditHistoryCoreService } from '../../credit/history/credit-history.service';

@Injectable()
export class PayCommonService {
  constructor(
    private readonly pspverifyService: PspverifyCoreService,
    private readonly accountService: AccountService,
    private readonly creditHistory: CreditHistoryCoreService
  ) {}

  async checkMoney(reqAmnt, userid): Promise<any> {
    if (isEmpty(reqAmnt)) throw new FillFieldsException();
    const account = await this.accountService.getWallet(userid);
    if (reqAmnt > account.balance) {
      return false;
    } else {
      return true;
    }
  }

  public setData(info: any) {
    return {
      CommandID: info,
      TraxID: info,
      CardNum: info,
      track2: info,
      TermID: info,
      Merchant: info,
      ReceiveDT: info,
      TrnAmt: info,
    };
  }

  public checkPan(cardnum, track2, secpin) {
    if (secpin === 0) secpin = 20650;
    const secpan = cardnum + '=' + secpin;
    if (secpan == track2) {
      return true;
    } else {
      return false;
    }
  }

  public setDataCloseLoop(getInfo, data, trackingCode?, referencenumber?, rscode?) {
    const Cid = parseInt(getInfo.CommandID.toString(), 10) + 100;
    return {
      CommandID: Cid,
      TraxID: getInfo.TraxID,
      CardNum: getInfo.CardNum || '',
      TermID: getInfo.TermID,
      Merchant: getInfo.Merchant,
      ReceiveDT: getInfo.ReceiveDT,
      TrnAmt: getInfo.TrnAmt,
      TermType: getInfo.termType || getInfo.TermType,
      UsedFromStoreAmt: 0,
      UsedFromBagAmt: getInfo.TrnAmt,
      UsedFromCreditAmt: 0,
      CreditLevel: 0,
      UsedFromPointAmt: 0,
      UsedFromOrganization: 0,
      TrackingCode: trackingCode,
      ReferenceNumber: referencenumber,
      Data: data,
      rsCode: rscode,
    };
  }

  public setDataShetab(getInfo, Rscode, shebasm, money, data, incomData, userid?) {
    const Cid = parseInt(getInfo.CommandID.toString(), 10) + 100;

    return {
      CommandID: Cid,
      TraxID: getInfo.TraxID,
      CardNum: getInfo.CardNum,
      TermID: getInfo.TermID,
      Merchant: getInfo.Merchant,
      ReceiveDT: getInfo.ReceiveDT,
      TrnAmt: getInfo.TrnAmt,
      TermType: getInfo.TermType || getInfo.termType,
      DiscAmt: money.discount,
      CreditBal: 0,
      BankDiscAmt: money.bankdisc,
      MerchantAmt: 0,
      NonBankDiscAmt: money.nonebank,
      Data: data,
      inCome: incomData,
      rsCode: 20,
    };
  }
  Error(getpspDto, rsCodex, userid, trackingCode?, referencenumber?) {
    const Cid = parseInt(getpspDto.CommandID.toString(), 10) + 100;
    return {
      CommandID: Cid,
      TraxID: getpspDto.TraxID,
      CardNum: getpspDto.CardNum,
      TermID: getpspDto.TermID,
      Merchant: getpspDto.Merchant,
      ReceiveDT: getpspDto.ReceiveDT,
      TrnAmt: getpspDto.TrnAmt,
      TermType: getpspDto.termType || getpspDto.TermType,
      TrackingCode: trackingCode,
      ReferenceNumber: referencenumber,
      Data: [],
      rsCode: rsCodex,
    };
  }

  async submitRequest(getpspDto, data, income): Promise<any> {
    const set = RequestTrans(
      getpspDto.CommandID,
      getpspDto.TraxID,
      getpspDto.TrnAmt,
      getpspDto.CardNum,
      getpspDto.TermID,
      getpspDto.Merchant,
      getpspDto.ReceiveDT,
      getpspDto.Track2,
      getpspDto.TermType,
      data,
      income,
      JSON.stringify(getpspDto)
    );
    return this.pspverifyService.newReq(set);
  }

  async submitMainRequest(
    user,
    cardref,
    merchantref,
    merchantid,
    terminalid,
    getInfo,
    storeinbalance,
    req,
    output,
    type,
    logid,
    creditid,
    discountid
  ): Promise<any> {
    const reqString = JSON.stringify(getInfo);
    const reqoutString = JSON.stringify(output);
    const verify = ReqMainTrans(
      user,
      cardref,
      merchantref,
      merchantid,
      terminalid,
      getInfo.TraxID,
      storeinbalance,
      req,
      reqString,
      reqoutString,
      type,
      creditid,
      discountid,
      logid,
      getInfo.termType
    );
    return this.pspverifyService.newPspVerify(verify);
  }

  async submitDiscountRequest(
    cowage,
    cardref,
    merchref,
    nonebank,
    bankdisc,
    discount,
    amount,
    storeinbalance,
    organization?,
    orgdetails?,
    lecredits?
  ): Promise<any> {
    const VerifyDiscount = {
      companywage: cowage,
      cardref: cardref,
      merchantref: merchref,
      nonebank: nonebank,
      bankdisc: bankdisc,
      discount: discount,
      amount: amount,
      storeinbalance: storeinbalance,
      organization: organization,
      orgdetails: orgdetails,
      lecredits,
    };
    return this.pspverifyService.newPspDiscount(VerifyDiscount);
  }

  async submitOrganRequest(
    user: string,
    strategy: string,
    terminal: string,
    amount: number,
    wallet: number,
    organ: number,
    charge: number,
    refid: string,
    cardid?: string
  ): Promise<any> {
    return this.pspverifyService.newOrgan(charge, wallet, amount, organ, terminal, user, strategy, refid, cardid);
  }

  async submitCreditRequest(
    from,
    to,
    terminal,
    amount,
    prepaid,
    installs,
    advance,
    type,
    cobenefit,
    tenday,
    tnyday,
    remain,
    status
  ): Promise<any> {
    const verifyCredit = ReqCreditHistoryTrans(
      from,
      to,
      terminal,
      amount,
      prepaid,
      advance,
      type,
      cobenefit,
      tenday,
      tnyday,
      remain
    );
    return this.creditHistory.submitNewHistoryRecord(verifyCredit).then((value) => {
      for (let i = 0; i < installs.length; i++) {
        const verifyInstalls = ReqInstallsTRans(value._id, installs[i].amount, installs[i].date * 1000);
        this.creditHistory.submitNewInstallsRecord(verifyInstalls).then((value) => {});
      }
      return value._id;
    });
  }

  async findTraxRequest(traxid, termid): Promise<any> {
    return await this.pspverifyService.findByTraxID(traxid, termid);
  }

  public setRemain(getInfo, RsCode, creditamt, storenonBankamt, bagnonebankamt, idm, org, point, leasingCredit = 0) {
    const Cid = parseInt(getInfo.CommandID.toString(), 10) + 100;
    const total = parseInt(creditamt) + parseInt(storenonBankamt) + parseInt(bagnonebankamt) + parseInt(idm);
    return {
      CommandID: Cid,
      CardNum: getInfo.CardNum,
      TraxID: getInfo.TraxID,
      TermID: getInfo.TermID,
      Merchant: getInfo.Merchant,
      ReceiveDT: getInfo.ReceiveDT,
      TermType: getInfo.termType || getInfo.TermType,
      CreditAmt: creditamt,
      StoreNoneBankAmt: storenonBankamt || 0,
      BagDiscAmt: total,
      BagNonBankAmt: bagnonebankamt || 0,
      Data: [
        {
          title: 'موجودی کیف پول',
          amount: bagnonebankamt.toLocaleString(),
        },
        /*{
          title: 'موجودی کارت اعتباری',
          amount: creditamt.toLocaleString(),
        },*/
        {
          title: 'کارت اعتباری',
          amount: leasingCredit.toLocaleString(),
        },
        {
          title: 'اعتبار در فروشگاه',
          amount: storenonBankamt.toLocaleString(),
        },
        {
          title: 'اعتبار در سازمانی',
          amount: org.toLocaleString(),
        },
        {
          title: 'امتیاز در فروشگاه',
          amount: point.toLocaleString(),
        },
      ],
      rsCode: RsCode,
    };
  }
}
