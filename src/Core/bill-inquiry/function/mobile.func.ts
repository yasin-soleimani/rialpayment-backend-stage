import { BillInquiryConfigConst } from '../const/config.const';

export function BillIqnuiryTelRequestModel(id: string, token = BillInquiryConfigConst.apikey) {
  return {
    Identity: {
      Token: token,
    },
    Parameters: {
      FixedLineNumber: id,
    },
  };
}

export function BillIqnuiryMCIRequestModel(id: string, token = BillInquiryConfigConst.apikey) {
  return {
    Identity: {
      Token: token,
    },
    Parameters: {
      MobileNumber: id,
    },
  };
}

export function BillInquiryMCISubmit(
  userid: string,
  type: number,
  amount: number,
  billid: string,
  paymentid: string,
  description: string,
  code: number,
  mobile: string,
  referer: string,
  term?: string
) {
  return {
    user: userid,
    type: type,
    amount: amount,
    billid: billid,
    paymentid: paymentid,
    description: description,
    code: code,
    mobile: mobile,
    term,
    referer,
  };
}
