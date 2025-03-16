import { Injectable } from '@vision/common';
import { MipgService } from '../../../Service/mipg/mipg.service';
import { PayIpgModel } from '../../basket/vitrin/services/pay.model';
import { LeasingInstallmentsPayIpgPayloadDto } from "../dto/leasing-installments-pay-ipg-payload.dto"

@Injectable()
export class LeasingInstallmentsIpgService {
  constructor(private readonly mipgService: MipgService) {}

  async makePay(
    terminalId: string,
    amount: number,
    callback: string,
    payload: LeasingInstallmentsPayIpgPayloadDto
  ): Promise<any> {
    const payModel = PayIpgModel(
      terminalId,
      amount,
      callback,
      JSON.stringify(payload),
      'LeCreditInstallmentsPay-' + new Date().getTime()
    );
    const token = await this.mipgService.validateIn(payModel);
    return token;
  }
}
