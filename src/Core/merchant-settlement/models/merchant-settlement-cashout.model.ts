import { Document } from 'mongoose';
import { UserModel } from '../../merchant/interfaces/merchantShare-model';
import { MerchantcoreDto } from '../../merchant/dto/merchantcore.dto';

export interface MerchantSettlementCashoutModel {
  _id?: string;
  user: string | UserModel;
  merchant: string | MerchantcoreDto;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  createdAt?: string | Date;
}

export type MerchantSettlementCashoutModelSchema = Document & MerchantSettlementCashoutModel;
