import { PossibleDeviceTypes } from '../../../utils/types.util';

export interface LeasingInstallmentToPay {
  id: string;
  amount: number;
}

export class PayInstallmentsDto {
  installments: LeasingInstallmentToPay[];
  amount: number;
  devicetype: PossibleDeviceTypes;
}
