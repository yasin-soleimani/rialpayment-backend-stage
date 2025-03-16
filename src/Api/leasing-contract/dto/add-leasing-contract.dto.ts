import { LeasingInvestmentPeriodEnum } from '../../../Core/leasing-contract/enums/leasing-investment-period.enum';

export class AddLeasingContractDto {
  title: string;
  description: string;
  investmentAmount: number;
  investmentPeriod: LeasingInvestmentPeriodEnum;
  startsAt: number;
  leasingRef: string;
}
