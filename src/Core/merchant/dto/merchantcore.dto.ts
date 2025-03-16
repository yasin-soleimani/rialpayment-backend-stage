export class MerchantcoreDto {
  _id?: string;
  readonly user: string;
  readonly psp: string;
  readonly ref: string;
  readonly email: string;
  readonly lat: number;
  readonly long: number;
  merchantcode: string;
  readonly title: string;
  readonly address: string;
  readonly province: string;
  readonly city: string;
  readonly tell: string;
  status: boolean;
  autoSettlePeriod?: number;
  autoSettleWage?: number;
  readonly category: string;
  readonly logo: string;
  readonly img1: string;
  readonly img2: string;
  readonly img3: string;
}
