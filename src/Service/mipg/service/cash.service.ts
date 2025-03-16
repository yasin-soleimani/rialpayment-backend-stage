import { Injectable, InternalServerErrorException } from '@vision/common';
import { AccountService } from '../../../Core/useraccount/account/account.service';

@Injectable()
export class MipgServiceCashtypeService {
  constructor(private readonly accountService: AccountService) {}

  async getCalc(terminalInfo: any, amount: number): Promise<any> {
    if (!terminalInfo.tokentype) throw new InternalServerErrorException();

    switch (terminalInfo.tokentype) {
      case 1: {
        return true;
      }

      case 2: {
      }

      case 3: {
        return true;
      }
    }
  }
}
