import { Injectable } from '@vision/common';
import { CheckoutBanksAccountCoreService } from '../../../Core/checkout/banks/services/bank-account.service';
import { BackofficeCheckoutBankAccountDto } from '../dto/account.dto';

@Injectable()
export class BackofficeCheckoutAccountService {
  constructor(private readonly bankAccountService: CheckoutBanksAccountCoreService) {}

  async addNew(getInfo: BackofficeCheckoutBankAccountDto): Promise<any> {
    return this.bankAccountService.addNew(getInfo);
  }
}
