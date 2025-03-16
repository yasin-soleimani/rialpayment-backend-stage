export class CreatePaymentDto {
  readonly terminalid: number;
  readonly amount: number;
  readonly payload: string;
  readonly callbackurl: string;
  readonly invoiceid: number;
  readonly status?: number;
  readonly type?: number;
}
