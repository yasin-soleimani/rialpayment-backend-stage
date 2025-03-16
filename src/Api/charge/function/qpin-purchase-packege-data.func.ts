import { PurchaseSimcardPackageDto } from '../dto/buy-simcard-package.dto';

export function returnQpinPurchasePackageData(data: PurchaseSimcardPackageDto): any {
  return {
    mobileOperatorId: data.operator,
    amount: data.amount,
    mobileNumber: data.mobile,
    packageCode: data.packageCode,
    clientTransactionId: data.clientTransactionId,
  };
}
