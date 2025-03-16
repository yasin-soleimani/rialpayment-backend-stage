import { Document } from 'mongoose';
import { LeasingRef } from '../../leasing-ref/interfaces/leasing-ref.interface';
import { LeasingContractStatusEnum } from '../enums/leasing-contract-status.enum';
import { LeasingInvestmentPeriodEnum } from '../enums/leasing-investment-period.enum';

export interface LeasingContract {
  title: string;
  deleted: boolean;
  status: LeasingContractStatusEnum;
  description: string;
  leasingUser: string;
  investmentAmount: number;
  remain: number;
  expiresAt: Date | string | number;
  startsAt: Date | string | number;
  investmentPeriod: LeasingInvestmentPeriodEnum;
  leasingRef: string | LeasingRef;
}

export interface LeasingContractDocument extends Readonly<LeasingContract>, Document {}
