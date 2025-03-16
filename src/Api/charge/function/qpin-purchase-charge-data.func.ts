import { SimcardChargeQpinDto } from '../dto/simcard.dto';

export function returnQpinPurchaseChargeData(data: SimcardChargeQpinDto): any {
  return {
    mobileOperatorId: data.operator,
    amount: data.amount,
    mobileNumber: data.mobile,
    rechargeCode: data.rechargeCode,
    clientTransactionId: data.clientTransactionId,
    optionalMessage: data?.optionalMessage ?? '',
  };
}
