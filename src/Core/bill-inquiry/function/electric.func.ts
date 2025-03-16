import { BillInquiryConfigConst } from '../const/config.const';

export function BillIqnuiryElectricRequestModel(id: string, token = BillInquiryConfigConst.apikey) {
  return {
    Identity: {
      Token: token,
    },
    Parameters: {
      ElectricityBillID: id,
    },
  };
}

export function BillInquiryElectricSubmit(userid: string, type: number, Parameters: any, Status: any, referer: string) {
  let amount,
    fullname,
    address,
    billid,
    paymentid,
    previousdate,
    currentdate,
    extrainfo = null;
  if (Parameters) {
    amount = Parameters.Amount;
    fullname = Parameters.FullName;
    address = Parameters.Address;
    billid = Parameters.BillID;
    paymentid = Parameters.PaymentID;
    previousdate = Parameters.PreviousDate;
    currentdate = Parameters.CurrentDate;
    extrainfo = Parameters.ExtraInfo;
  }
  return {
    user: userid,
    type: type,
    amount: amount,
    fullname: fullname,
    address: address,
    billid: billid,
    paymentid: paymentid,
    previousdate: previousdate,
    currentdate: currentdate,
    extrainfo: extrainfo,
    description: Status.Description,
    code: Status.Code,
    referer,
  };
}
