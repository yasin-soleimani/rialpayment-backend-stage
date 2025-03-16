import { Injectable } from '@vision/common';
import { LeasingApplyDocument } from '../../../Core/leasing-apply/interfaces/leasing-apply.interface';
import { MipgService } from '../../../Service/mipg/mipg.service';
import { PayIpgModel } from '../../basket/vitrin/services/pay.model';

@Injectable()
export class LeasingApplyIpgService {
  constructor(private readonly mipgService: MipgService) {}

  async makePay(
    terminalId: string,
    amount: number,
    callback: string,
    payload: Pick<LeasingApplyDocument, '_id'> & { userId: string }
  ): Promise<any> {
    const payModel = PayIpgModel(
      terminalId,
      amount,
      callback,
      JSON.stringify(payload),
      'LeCreditApplyPay-' + new Date().getTime()
    );
    const token = await this.mipgService.validateIn(payModel);
    return token;
  }
}
