import { Injectable } from '@vision/common';
import { CheckoutBanksCoreService } from '../../../Core/checkout/banks/services/banks.service';

@Injectable()
export class BackofficeCheckoutBanksService {
  constructor(private readonly banksService: CheckoutBanksCoreService) {}

  async getBanksList(): Promise<any> {
    return this.banksService.getBanksList();
  }

  async addNew(bankname: string): Promise<any> {
    return this.banksService.addBank(bankname);
  }
}
