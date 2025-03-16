import { BillInquiryConfigConst } from '../const/config.const';

export function BillIqnuiryCarCrimeRequestModel(id: string, token = BillInquiryConfigConst.apikey) {
  return {
    Identity: {
      Token: token,
    },
    Parameters: {
      BarCode: id,
    },
  };
}
