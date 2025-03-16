import { Injectable } from '@vision/common';
import { PayCommonService } from '../../../../Core/pay/services/pay-common.service';
import { PspverifyCoreService } from '../../../../Core/psp/pspverify/pspverifyCore.service';

@Injectable()
export class SwitchCreditConfirmService {
  constructor(
    private readonly commonService: PayCommonService,
    private readonly pspverifyService: PspverifyCoreService
  ) {}

  async confirm(traxData, getInfo): Promise<any> {
    if (traxData.confirm === true || traxData.reverse === true) {
      return this.commonService.Error(getInfo, 15, null, ' ', ' ');
    }

    const confirm = await this.pspverifyService.confirm(traxData.TraxID);
    if (confirm) {
      return this.commonService.setDataCloseLoop(getInfo, null, null, null, 17);
    } else {
      return this.commonService.Error(getInfo, 10, traxData.user.id);
    }
  }
}
