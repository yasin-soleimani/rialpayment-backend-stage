export class CheckoutDto {
  user: string;
  readonly account: string;
  readonly bankname: string;
  readonly bankcode: number;
  type: number;
  readonly preaccount: string;
}
