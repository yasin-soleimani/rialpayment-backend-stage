import { Injectable } from '@vision/common';
import { IPGTypes } from '@vision/common/constants/ipg.const';
import { discountChangable } from '@vision/common/utils/load-package.util';

@Injectable()
export class VitrinWageService {
  constructor() {}

  async typeSelector(type, amount, percent): Promise<any> {
    switch (type) {
      case IPGTypes.percent: {
        return discountChangable(amount, percent);
      }

      case IPGTypes.amount: {
        const money = amount - percent;
        return {
          discount: percent,
          total: amount,
          amount: money,
        };
      }

      case IPGTypes.abonman: {
        return {
          discount: 0,
          total: amount,
          amount: amount,
        };
      }

      default: {
        return discountChangable(amount, 5);
      }
    }
  }
}
