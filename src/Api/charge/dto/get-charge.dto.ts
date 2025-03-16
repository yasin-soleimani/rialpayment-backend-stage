export class GetChargeDto {
  user: string;
  ref: string;
  terminalid: number;
  status: number;
  readonly amount: number;
  readonly payload: string;
  callbackurl: string;
  invoiceid: string;
  readonly cardno: string;
  readonly password: string;
  readonly nationalcode: string;
  readonly cardpassword: string;
  devicetype: string;
  mobile: number;
}
