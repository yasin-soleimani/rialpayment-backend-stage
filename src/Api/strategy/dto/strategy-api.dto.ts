export class StrategyApiDto {
  user: string;
  terminal: string;
  readonly merchant?: string;
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
  readonly opt?: number;
  group?: string;
  parent?: string;
}
