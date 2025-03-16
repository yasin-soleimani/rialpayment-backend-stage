import { Injectable } from '@vision/common';
const parserXml = require('fast-xml-parser');
const Parser2 = require('fast-xml-parser').j2xParser;
import * as soap from 'soap';
import { GetPspDto } from '../dto/get-psp.dto';
import { isUndefined } from '@vision/common/utils/shared.utils';
import { isArray, isObject } from 'util';

@Injectable()
export class SoapHamidService {
  constructor() {}

  async operator(getInfo: GetPspDto): Promise<any> {
    switch (getInfo.CommandID.toString()) {
      case '104': {
        return await this.doTransaction(getInfo);
      }

      case '103': {
        return await this.doGetBalance(getInfo);
      }

      case '106': {
        return await this.doConfirmation(getInfo);
      }

      case '107': {
        return await this.doReverse(getInfo);
      }
    }
  }

  async doTransaction(getInfo: GetPspDto): Promise<any> {
    const url = 'http://185.105.185.130:8088/?wsdl';

    const username = getInfo.Username;
    const password = getInfo.Password;
    delete getInfo['Username'];
    delete getInfo['Password'];
    const validData = this.getDataTransform(getInfo);
    var parser = new Parser2();
    var xml = parser.parse(validData);

    const args = {
      username: username,
      password: password,
      InputXML: xml,
    };
    const clientx = await soap.createClientAsync(url);
    let xy = await clientx.doTransactionAsync(args);
    var jsonObj = parserXml.parse(xy[0].doTransactionReturn);

    return this.resDataTransform(jsonObj.doTransactionResult, getInfo);
  }

  async doGetBalance(getInfo: GetPspDto): Promise<any> {
    const url = 'http://185.105.185.130:8088/?wsdl';

    const username = getInfo.Username;
    const password = getInfo.Password;
    delete getInfo['Username'];
    delete getInfo['Password'];
    const validData = this.getDataTransform(getInfo);
    var parser = new Parser2();
    var xml = parser.parse(validData);

    const args = {
      username: username,
      password: password,
      InputXML: xml,
    };
    const clientx = await soap.createClientAsync(url);
    let xy = await clientx.doGetBalanceAsync(args);
    const jsonObj = parserXml.parse(xy[0].doGetBalanceReturn);
    return this.resDataTransform(jsonObj.doGetBalanceResult, getInfo);
  }

  async doConfirmation(getInfo: GetPspDto): Promise<any> {
    const url = 'http://185.105.185.130:8088/?wsdl';

    const username = getInfo.Username;
    const password = getInfo.Password;
    delete getInfo['Username'];
    delete getInfo['Password'];
    const validData = this.getDataTransform(getInfo);
    var parser = new Parser2();
    var xml = parser.parse(validData);

    const args = {
      username: username,
      password: password,
      InputXML: xml,
    };
    const clientx = await soap.createClientAsync(url);
    let xy = await clientx.doConfirmationAsync(args);
    const jsonObj = parserXml.parse(xy[0].doConfirmationReturn);
    return this.resDataTransform(jsonObj.doConfirmationResult, getInfo);
  }

  async doReverse(getInfo: GetPspDto): Promise<any> {
    const url = 'http://185.105.185.130:8088/?wsdl';

    const username = getInfo.Username;
    const password = getInfo.Password;
    delete getInfo['Username'];
    delete getInfo['Password'];
    const validData = this.getDataTransform(getInfo);
    var parser = new Parser2();
    var xml = parser.parse(validData);

    const args = {
      username: username,
      password: password,
      InputXML: xml,
    };
    const clientx = await soap.createClientAsync(url);
    let xy = await clientx.doReverseAsync(args);
    const jsonObj = parserXml.parse(xy[0].doReverseReturn);
    return this.resDataTransform(jsonObj.doReverseResult, getInfo); // const client = await soap.createClientAsync(url);
  }

  private getDataTransform(data) {
    return {
      Username: data.Username,
      Password: data.Password,
      commandID: data.CommandID,
      trxId: data.TraxID,
      cardNum: data.CardNum,
      track2: data.Track2,
      termID: data.TermID,
      termId: data.TermID,
      merchant: data.Merchant,
      receiveDT: data.ReceiveDT,
      trnAmt: data.TrnAmt,
      pin: data.Pin,
      trnSeqCntr: data.trnSeqCntr,
      termType: data.TermType || data.termType,
    };
  }

  private resDataTransform(data, incomeData) {
    if (isUndefined(data.commandID)) {
      return this.ErrorRes(incomeData, 10);
    }
    let bagDiscAmt;
    if (data.commandID == 203) {
      bagDiscAmt = data.BagDiscAmt || 0;
    }
    let dataIncome;
    if (!isUndefined(data.income)) {
      dataIncome = [
        {
          sheba: data.income.vages[0].entityCode,
          amount: data.income.vages[0].incomeAmt,
        },
        {
          sheba: data.income.vages[1].entityCode,
          amount: data.income.vages[1].incomeAmt,
        },
      ];
    }
    let forPrint;
    if (!isUndefined(data.forprint)) {
      forPrint = data.forprint.print;
    }

    const ForPrintArray = this.checkForPrint(forPrint);

    return {
      CommandID: data.commandID,
      TraxID: data.trxID || incomeData.TraxID,
      CardNum: data.cardNum,
      TermID: data.termID || incomeData.TermID,
      Merchant: data.merchant,
      ReceiveDT: data.receiveDT || incomeData.ReceiveDT,
      TrnAmt: data.trnAmt || incomeData.TrnAmt,
      TermType: data.termType || incomeData.TermType,
      DiscAmt: data.discAmt,
      CreditBal: data.creditBal,
      BankDiscAmt: data.BankDiscAmt,
      MerchantAmt: data.MerchantAmt,
      NonBankDiscAmt: data.NonBankDiscAmt,
      CreditAmt: data.CreditAmt,
      StoreNoneBankAmt: data.StoreNonBankAmt,
      BagDiscAmt: bagDiscAmt,
      BagNonBankAmt: data.BagNonBankAmt,
      UsedFromStoreAmt: data.UsedFromStoreAmt,
      UsedFromBagAmt: data.UsedFromBagAmt,
      UsedFromCreditAmt: data.UsedFromCreditAmt,
      CreditLevel: data.creditLevel,
      UsedFromPointAmt: data.UsedFromPointAmt,
      UsedFromOrganization: data.UsedFromOrganizationAmt,
      TrackingCode: data.TrackingCode,
      ReferenceNumber: data.ReferenceNumber,
      Data: ForPrintArray || [],
      inCome: dataIncome,
      rsCode: data.rsCode,
    };
  }

  private checkForPrint(forPrint) {
    let forPrintArray = Array();
    if (!isArray(forPrint)) {
      forPrintArray.push(forPrint);
      return forPrintArray;
    } else {
      return forPrint;
    }
  }

  ErrorRes(getpspDto, rsCodex) {
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
      TrackingCode: null,
      ReferenceNumber: null,
      Data: [],
      rsCode: rsCodex,
    };
  }
}
