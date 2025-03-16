export class OrganizationStrategyDto {
  group: string;
  terminal: any;
  min: number;
  max: number;
  expire: number;
  refresh: number;
  amount: number;
  user: string;
  customercharge: number;
  saturday?: boolean;
  sunday?: boolean;
  monday?: boolean;
  tuesday?: boolean;
  wednesday?: boolean;
  thursday?: boolean;
  friday?: boolean;
  daysofweek: any;
}
