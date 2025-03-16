export class IpgCoreDto {
  user?: string;
  ref?: string;
  terminalid?: number;
  status?: number;
  type?: number;
  token?: string;
  orderid?: number;
  details?: {
    respmsg: string;
  };
  terminalinfo?: {
    loginaccount: string;
    mid: string;
  };
  readonly amount?: number;
  payload?: string;
  readonly callbackurl?: string;
  readonly invoiceid?: string;
  readonly userinvoice?: string;
  readonly cardno?: string;
  readonly password?: string;
  readonly nationalcode?: string;
  readonly cardpassword?: string;
  pardakhtyari?: boolean;
  devicetype?: string;
  isdirect?: boolean;
  tmp?: string;
  auth?: boolean;
}
