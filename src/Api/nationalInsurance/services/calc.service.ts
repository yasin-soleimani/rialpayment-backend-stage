import { Injectable, InternalServerErrorException } from '@vision/common';
import { nationalInsuranceDivType } from '../../../Core/insurance/const/nationalInsurance.const';

@Injectable()
export class NationalInsuranceCalcApiService {
  constructor() {}

  async calc(divtype: number, qty: number, type: number): Promise<any> {
    if (type === 1) {
      return this.divFalse(qty);
    }

    if (type === 2) {
      return this.divTrue(divtype, qty);
    }
  }

  private divTrue(divtype: number, qty: number) {
    let total = 0;
    switch (divtype) {
      case nationalInsuranceDivType.Ceil: {
        const person = Math.ceil(qty / 2);
        total = person;
        break;
      }

      case nationalInsuranceDivType.Floor: {
        const person = Math.floor(qty / 2);
        total = person;
        break;
      }

      default: {
        throw new InternalServerErrorException();
      }
    }

    return total;
  }

  private divFalse(qty: number) {
    return qty;
  }
}
