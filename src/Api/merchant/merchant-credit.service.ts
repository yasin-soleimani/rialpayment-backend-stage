import { Injectable, successOpt, faildOpt } from '@vision/common';
import { MerchantCreditCoreService } from '../../Core/credit/merchantcredit/merchantcredit.service';
import { MerchantCreditDto } from './dto/merchant-credit.dto';
import { MerchantcoreService } from '../../Core/merchant/merchantcore.service';
import { MerchantCoreTerminalService } from '../../Core/merchant/services/merchant-terminal.service';

@Injectable()
export class MerchantCreditService {
  constructor(
    private readonly creditService: MerchantCreditCoreService,
    private readonly merchantService: MerchantcoreService,
    private readonly terminalService: MerchantCoreTerminalService
  ) {}

  async submitNew(getInfo: MerchantCreditDto): Promise<any> {
    const data = await this.creditService.addNew(getInfo);
    if (data) {
      this.terminalService.setTerminalCreditStatus(getInfo.type, getInfo.terminal, true);
      return successOpt();
    } else {
      return faildOpt();
    }
  }
}
