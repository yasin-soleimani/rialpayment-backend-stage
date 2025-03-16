import { getMerchantInfo, ipgWSDLInsert, ipgWSDLUpdate } from '../common/getMerchantInfo';
import { getIp, globalIpCheck } from '../common/checkip';
import { isEmpty } from '@vision/common/utils/shared.utils';
import * as soap from 'soap';
import * as uid from 'uniqid';

export function ParsianConfirmRequest(args, req, callback) {
  getTerminalInfo(args.requestData.LoginAccount).then(async (res) => {
    const terminalInfo = await getTerminalInfo(args.requestData.LoginAccount);

    // const ip = getIp( req )
    // const ipvalid = globalIpCheck( terminalInfo , ip);
    // if ( !ipvalid ) {
    //   callback({ ConfirmPaymentResult: { Status: '-127', RRN: '0', Token: '0' } } );
    //   return false;
    // }

    if (isEmpty(res)) {
      callback({ ConfirmPaymentResult: { Status: '-127', RRN: '0', Token: '0' } });
      return false;
    }

    if (res.status == false) {
      callback({ ConfirmPaymentResult: { Status: '-126', RRN: '0', Token: '0' } });
      return false;
    }

    const client = await soap.createClientAsync(
      'https://pec.shaparak.ir/NewIPGServices/Confirm/ConfirmService.asmx?wsdl'
    );
    if (!client) {
      callback({
        SalePaymentRequestResult: { Token: '0', Message: 'UnkownError', Status: '-32768' },
      });
      return false;
    }

    const data = await client.ConfirmPaymentAsync({
      requestData: {
        LoginAccount: res[0].loginaccount,
        Token: args.requestData.Token,
      },
    });
    const message = messageSelector(data[0].ConfirmPaymentResult.Status);
    ipgWSDLUpdate(
      data[0].ConfirmPaymentResult.Token,
      data[0].ConfirmPaymentResult.RRN,
      data[0].ConfirmPaymentResult.Status,
      message
    ).then((res) => {
      callback(data[0]);
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

function messageSelector(code) {
  switch (code) {
    case -138: {
      return 'عملیات توسط کاربر لغو شد';
    }

    case -127: {
      return 'آدرس اینترنتی نامعتبر می باشد';
    }

    case -126: {
      return 'کد شناسایی پذیرنده معتبر نمی باشد';
    }

    case -131: {
      return 'توکن معتبر نمی باشد';
    }

    default: {
      return 'تراکنش تکمیل نشده است';
    }
  }
}
