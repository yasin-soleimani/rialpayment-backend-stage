import { PossibleDeviceTypes } from '../../../utils/types.util';
import { LeasingInstallmentToPay } from './pay-installments.dto';

export class LeasingInstallmentsPayIpgPayloadDto {
  userId: string;
  installments: LeasingInstallmentToPay[];
  amount: number;
  devicetype: PossibleDeviceTypes;
  referer: string;
  leasingUserId: string;
}
