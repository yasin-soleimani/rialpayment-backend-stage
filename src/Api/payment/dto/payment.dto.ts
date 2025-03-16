export class PaymentDto {
  user: string;
  _id: string;
  pin?: string;
  readonly payid: any;
  readonly amount: number;
  type: number;
  description: string;
  installs?: any;
  barcode: string;
  ref: string;
  cardno?: number;
  secpin?: number;
}
