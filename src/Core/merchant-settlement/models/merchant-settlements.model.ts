import { Document } from 'mongoose';
import { UserModel } from '../../merchant/interfaces/merchantShare-model';
import { MerchantCore } from '../../merchant/interfaces/merchandcore.interface';
import { MerchantTerminalCoreDto } from '../../merchant/dto/merchanterminalcore.dto';
import { MerchantSettlementReportModel } from './merchant-settlement-report.model';

export interface MerchantSettlementsModel {
  user: string | UserModel;
  report: string | MerchantSettlementReportModel;
  merchant: string | MerchantCore;
  forDate: string;
  fromDate: string | Date;
  toDate: string | Date;
  sum: number;
  sumAfterWage: number;
  wage: number;
  terminals: {
    terminal: string | MerchantTerminalCoreDto;
    sum: number;
    sumAfterWage: number;
    wage: number;
  }[];
}

export type MerchantSettlementsModelSchema = Document & MerchantSettlementsModel;
