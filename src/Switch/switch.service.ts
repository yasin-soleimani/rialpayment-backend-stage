import { Injectable, InternalServerErrorException } from '@vision/common';
import { NewSwitchDto } from './dto/new-switch.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { switchOperationService } from './services/switch-buy.service';
import { PayCommonService } from '../Core/pay/services/pay-common.service';
import { GetRemainService } from './services/closeloop/getremain.service';
import { MerchantCoreTerminalService } from '../Core/merchant/services/merchant-terminal.service';

@Injectable()
export class NewSwitchService {
  constructor(
    private readonly switchOpt: switchOperationService,
    private readonly terminalService: MerchantCoreTerminalService,
    private readonly commonService: PayCommonService,
    private readonly getRemainService: GetRemainService
  ) {}

  // select Transaction opt
  async opertaor(getInfo: NewSwitchDto): Promise<any> {
    // check Command id
    if (isEmpty(getInfo.CommandID)) throw new InternalServerErrorException();
    // check Merchant & Terminal
    const terminalInfo = await this.terminalService.findMerchantByTerminalId(getInfo.TermID);
    if (!terminalInfo || !terminalInfo.merchant.status || !terminalInfo.status) {
      return this.commonService.Error(getInfo, 1, null, null, null);
    }

    // Switch Transaction commandid
    switch (getInfo.CommandID.toString()) {
      case '104': {
        return this.switchOpt.Buy(getInfo, terminalInfo);
      }

      case '103': {
        return this.getRemainService.getRemain(getInfo, terminalInfo);
      }

      case '106': {
        return this.switchOpt.confirm(getInfo);
      }

      case '107': {
        return this.switchOpt.reverse(getInfo);
      }
    }
  }
}
