import { Inject, Injectable, successOpt } from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { CounterCoreService } from '../../../Core/counter/counter.service';
import { LoggerCoreReportService } from '../../../Core/logger/services/report.service';
import { InvoiceBillingType } from '../const/invoice-type.const';
import { invoiceBillingDateRangeMonthFunc } from '../func/date.func';
import { InvoiceBillingClubDetailsFunc } from '../func/details-calc.func';
import { InvoiceBillingCommonCoreService } from './common.service';

@Injectable()
export class InvoiceBillingClubCoreService {
  constructor(
    private readonly logReportService: LoggerCoreReportService,
    private readonly commonService: InvoiceBillingCommonCoreService,
    private readonly counterService: CounterCoreService
  ) {}

  async addNew(date): Promise<any> {
    const dateRange = invoiceBillingDateRangeMonthFunc(date);

    // Check Exist Data || Check duplicate
    const exist = await this.commonService.getData(InvoiceBillingType.Club, dateRange.start, dateRange.end);
    if (exist) throw new UserCustomException('قبلا برای این ماه فاکتور صادر شده است', false, 500);

    this.makeInvoice(dateRange);

    return successOpt();
  }

  private async makeInvoice(dateRange): Promise<any> {
    const cond = {
      ref: { $regex: new RegExp('Club-+') },
      createdAt: {
        $gte: dateRange.start,
        $lte: dateRange.end,
      },
    };
    const data = await this.logReportService.getInvoiceData(cond);
    const date = dateRange.end;

    for (const item of data) {
      if (item.total > 0 && item.wage > 0) {
        const invoiceid = await this.counterService.getNumber();
        const details = InvoiceBillingClubDetailsFunc(item.companywage);
        item['total'] = details.total;
        item['wage'] = details.total;
        const invoice = await this.commonService.addInvoice(item, invoiceid, InvoiceBillingType.Club, date);
        const title = 'کارمزد ثبت باشگاه مشتریان از تاریخ ' + dateRange.from + ' الی ' + dateRange.to;
        // const title = 'کارمزد ثبت باشگاه مشتریان از تاریخ 1398/01/01 الی 1398/12/29';
        const unitPrice = Math.floor(item.wage / item.count);

        await this.commonService.addDetails(item, details, 1, title, 'تعداد', unitPrice, invoice._id);
        await this.commonService.updateDetails(invoice._id, {
          totalwage: details.total,
          totalcompanywage: details.companywage,
          totalagentwage: details.agentwage,
          totalpayamount: details.total,
          totaltax: details.tax,
          totalpureamount: details.companywage + details.tax,
        });
      }
    }
  }
}
