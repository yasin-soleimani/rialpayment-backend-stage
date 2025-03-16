import { Injectable, successOptWithDataNoValidation } from '@vision/common';
import { CheckoutBanksAccountCoreService } from '../../../Core/checkout/banks/services/bank-account.service';

@Injectable()
export class CashoutAccountBackofficeService {
  constructor(private readonly accountService: CheckoutBanksAccountCoreService) {}

  async getList(): Promise<any> {
    const data = await this.accountService.getList();
    return successOptWithDataNoValidation(data);
  }
}
