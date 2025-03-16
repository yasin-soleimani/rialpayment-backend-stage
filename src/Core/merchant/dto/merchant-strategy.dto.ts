export class MerchantStrategyDto {
  user: string;
  terminal: any;
  merchant?: any;
  readonly type: number;
  readonly start: string;
  readonly expire: string;
  readonly bankdisc: number;
  readonly nonebankdisc: number;
  readonly from: string;
  readonly to: string;
  daysofweek: any;
  readonly priority: string;
  readonly automaticwage: boolean;
  readonly wage: number;
  readonly wagetime: number;
  readonly percentpertime: number;
  readonly saturday: boolean;
  readonly sunday: boolean;
  readonly monday: boolean;
  readonly tuesday: boolean;
  readonly wednesday: boolean;
  readonly thursday: boolean;
  readonly friday: boolean;
  opt?: number;
  group?: string;
  readonly parent?: string;
}
