import { Injectable, InternalServerErrorException, successOpt, successOptWithDataNoValidation } from '@vision/common';
import { CheckoutAutomaticService } from '../../../Core/checkout/automatic/checkout-automatic.service';
import { CashoutAutomaticValidation } from '../function/validate.func';
import { CheckoutAutomaticCoreDto } from '../../../Core/checkout/automatic/dto/checkout-automatic.dto';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';

@Injectable()
export class CashoutAutomaticBackofficeService {
  constructor(private readonly checkoutAutomaticService: CheckoutAutomaticService) {}

  async addNew(getInfo: CheckoutAutomaticCoreDto): Promise<any> {
    CashoutAutomaticValidation(getInfo);

    await this.checkoutAutomaticService.disableAllByUserId(getInfo.user);

    const data = await this.checkoutAutomaticService.addNew(getInfo);
    if (!data) throw new InternalServerErrorException();

    return successOpt();
  }

  async changeStatus(id: string, status: boolean): Promise<any> {
    if (isEmpty(id)) throw new FillFieldsException();

    const data = await this.checkoutAutomaticService.changeStatus(id, status);
    if (!data) throw new InternalServerErrorException();

    return successOpt();
  }

  async getLast(userid: string): Promise<any> {
    const data = await this.checkoutAutomaticService.getLast(userid);

    return successOptWithDataNoValidation(data);
  }
}
