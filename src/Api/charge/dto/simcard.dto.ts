import { SimcardOperatorIdEnum } from '../constants/simcard-operator-id.enum';
import { SimcardRechargeCodeEnum } from '../constants/simcard-recharge-code.enum';

export class SimcardChargeDto {
  amount: number;
  mobile: string;
  operator: number;
  type: number;
}

export class SimcardChargeQpinDto {
  operator: SimcardOperatorIdEnum;
  amount: number;
  mobile: string;
  rechargeCode: SimcardRechargeCodeEnum;
  clientTransactionId?: string;
  optionalMessage: string;
}
