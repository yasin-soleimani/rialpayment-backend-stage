export class ChargeIpgServiceDto {
  cardno: number;
  fullname: string;
  description: string;
  amount: number;
  nickname: string;
  user?: string;
  invoiceid?: string;
  callbackurl?: string;
  payload?: string;
  account_no: number;
}
