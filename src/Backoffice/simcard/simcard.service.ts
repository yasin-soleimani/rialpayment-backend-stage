import { Injectable, successOptWithDataNoValidation } from '@vision/common';
import { SimcardCommonCoreService } from '../../Core/simcard/services/common.service';
import { discountPercent } from '@vision/common/utils/load-package.util';
import { LogegerCoreTodayService } from '../../Core/logger/services/today-log.service';

@Injectable()
export class SimcardBackofficeService {
  constructor(
    private readonly simcardService: SimcardCommonCoreService,
    private readonly loggerService: LogegerCoreTodayService
  ) {}

  async getReport(getInfo): Promise<any> {
    // const data =await this.simcardService.report( getInfo.from, getInfo.to );
    // if ( !!data ) throw new UserCustomException('یافت نشد');

    const data = await this.loggerService.getMobileCharge(new Date(Number(getInfo.from)), new Date(Number(getInfo.to)));
    return data;
    const discount = discountPercent(data[0].amount, 5);
    return successOptWithDataNoValidation({
      count: data[0].count,
      total: discount.total,
      discount: discount.discount,
      paid: discount.amount,
    });
  }
}
