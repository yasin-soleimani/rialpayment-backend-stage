import { Document } from 'mongoose';
import { MerchantCore } from '../../merchant/interfaces/merchandcore.interface';

export interface MerchantSettlementReportModel {
  _id?: string;
  date: string;
  startDate: string | Date;
  endDate: string | Date;
  sum: number;
  sumAfterWage: number;
  wage: number;
  merchants: {
    merchant: string | MerchantCore;
    sum: number;
    sumAfterWage: number;
    wage: number;
  }[];
}

export type MerchantSettlementReportModelSchema = Document & MerchantSettlementReportModel;
