import { Injectable } from '@vision/common';
import { SwitchShetabService } from './shetab-discount.service';
import { SwitchCloseloopService } from './closeloop.discount.service';

@Injectable()
export class SwitchDiscountService {
  constructor(
    private readonly shetabService: SwitchShetabService,
    private readonly closeloopService: SwitchCloseloopService
  ) { }

  async newPayment(cardType, getInfo, cardInfo, terminalInfo, discountInfo): Promise<any> {
    switch (cardType) {
      case 'shetab': {
        return this.shetabService.newPayment(getInfo, cardInfo, terminalInfo, discountInfo);
      }

      case 'closeloop': {
        return this.closeloopService.newPayment(getInfo, cardInfo, terminalInfo, discountInfo);
      }
    }
  }
}
