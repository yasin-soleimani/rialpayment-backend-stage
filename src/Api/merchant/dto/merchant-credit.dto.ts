export class MerchantCreditDto {
  _id: string;
  readonly terminal: string;
  readonly type: number;
  readonly advance: {
    readonly qty: number;
    readonly benefit: number;
    readonly prepayment: number;
    readonly beforedeadline: number;
  };
  readonly tenday: number;
  readonly tnyday: number;
  readonly cobenefit: number;
  readonly status: boolean;
}
