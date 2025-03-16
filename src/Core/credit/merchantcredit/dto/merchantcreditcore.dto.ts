export class MerchantCreditCoreDto {
  _id: string;
  terminal: string;
  type: number;
  advance: {
    qty: number;
    benefit: number;
    prepayment: number;
    beforedeadline: number;
  };
  tenday: number;
  tnyday: number;
  cobenefit: number;
  primarybenefit?: number;
  status: boolean;
}
