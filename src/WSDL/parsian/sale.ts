import * as soap from 'soap';
import { getIp, globalIpCheck } from '../common/checkip';
import { getMerchantInfo, ipgWSDLInsert } from '../common/getMerchantInfo';
import { isEmpty } from '@vision/common/utils/shared.utils';
import * as uid from 'uniqid';

export function ParsianSaleRequest(args, req, callback) {
  getTerminalInfo(args.requestData.LoginAccount).then(async (res) => {
    const terminalInfo = await getMerchantInfo(args.requestData.LoginAccount);

    const ip = getIp(req);
    const ipvalid = globalIpCheck(terminalInfo, ip);
    console.log(ipvalid, 'ip');
    if (!ipvalid) {
      callback({ SalePaymentRequestResult: { Token: '0', Message: 'InvalidMerchantIp', Status: '-127' } });
      return false;
    }

    if (isEmpty(res)) {
      callback({
        SalePaymentRequestResult: { Token: '0', Message: 'InvalidMerchantPin', Status: '-126' },
      });
      return false;
    }

    if (res.status == false) {
      callback({
        SalePaymentRequestResult: { Token: '0', Message: 'InvalidMerchantPin', Status: '-126' },
      });
      return false;
    }

    const client = await soap.createClientAsync('https://pec.shaparak.ir/NewIPGServices/Sale/SaleService.asmx?wsdl');
    if (!client) {
      callback({
        SalePaymentRequestResult: { Token: '0', Message: 'UnkownError', Status: '-32768' },
      });
      return false;
    }

    const data = await client.SalePaymentRequestAsync({
      requestData: {
        LoginAccount: res[0].loginaccount,
        Amount: args.requestData.Amount,
        OrderId: args.requestData.OrderId,
        CallBackUrl: args.requestData.CallBackUrl,
        AdditionalData: args.requestData.AdditionalData,
      },
    });

    const ref = uid('Parsian-');

    ipgWSDLInsert(
      terminalInfo.user,
      ref,
      args.requestData.OrderId,
      args.requestData.Amount,
      res[0].karmozd,
      res[0].type,
      args.requestData.CallBackUrl,
      args.requestData.AdditionalData
    )
      .then((res) => {
        if (res) callback(data[0]);
      })
      .catch((err) => {
        callback({
          SalePaymentRequestResult: { Token: '0', Message: 'UnkownError', Status: '-32768' },
        });
      });
  });
}

function getTerminalInfo(loginAccount) {
  return getMerchantInfo(loginAccount).then((res) => {
    if (res.status == false) return false;
    if (!res) return false;
    if (!res.direct) return false;
    return res.direct.filter(function (el) {
      return el.psp == 2;
    });
  });
}
