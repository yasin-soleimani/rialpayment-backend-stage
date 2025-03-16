import { SimcardOperatorIdEnum } from '../constants/simcard-operator-id.enum';

export class PurchaseSimcardPackageDto {
  operator: SimcardOperatorIdEnum;
  amount: number;
  mobile: string;
  type: number;
  packageCode: string;
  clientTransactionId?: string;
}
