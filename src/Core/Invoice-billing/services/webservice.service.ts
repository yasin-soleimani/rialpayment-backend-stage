import { Inject, Injectable, successOpt } from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { CounterCoreService } from '../../../Core/counter/counter.service';
import { LoggerCoreReportService } from '../../../Core/logger/services/report.service';
import { InvoiceBillingType } from '../const/invoice-type.const';
import { invoiceBillingDateRangeMonthFunc } from '../func/date.func';
import { InvoiceBillingPosDetailsFunc, InvoiceBillingWagePercentCalc } from '../func/details-calc.func';
import { InvoiceBillingCommonCoreService } from './common.service';

@Injectable()
export class InvoiceBillingWebserviceCoreService {
  constructor(
    private readonly logReportService: LoggerCoreReportService,
    private readonly commonService: InvoiceBillingCommonCoreService,
    private readonly counterService: CounterCoreService
  ) {}
  async addNew(date: any): Promise<any> {
    const dateRange = invoiceBillingDateRangeMonthFunc(date);

    // Check Exist Data || Check duplicate
    const exist = await this.commonService.getData(InvoiceBillingType.WebService, dateRange.start, dateRange.end);
    if (exist) throw new UserCustomException('قبلا برای این ماه فاکتور صادر شده است', false, 500);

    this.makeInvoice(dateRange);
    return successOpt();
  }

  private async makeInvoice(dateRange): Promise<any> {
    const cond = {
      ref: { $regex: new RegExp('WebServiceWage-+') },
      createdAt: {
        $gte: dateRange.start,
        $lte: dateRange.end,
      },
    };
    const date = dateRange.end;
    const data = await this.logReportService.getInvoiceData(cond);
    for (const item of data) {
      if (item.total > 0 && item.wage > 0) {
        const invoiceid = await this.counterService.getNumber();

        const invoice = await this.commonService.addInvoice(item, invoiceid, InvoiceBillingType.WebService, date);

        const title = 'کارمزد خدمات وب سرویس از تاریخ ' + dateRange.from + ' الی ' + dateRange.to;
        // const title = 'کارمزد خدمات وب سرویس از تاریخ 1398/01/01 الی 1398/12/29';

        const details = InvoiceBillingPosDetailsFunc(item.companywage, item.agentwage);
        const unitPrice = InvoiceBillingWagePercentCalc(item.total, item.count);
        await this.commonService.addDetails(item, details, 1, title, 'تعداد', unitPrice, invoice._id);
        await this.commonService.updateDetails(invoice._id, {
          totalwage: item.wage,
          totalcompanywage: details.companywage,
          totalagentwage: details.agentwage,
          totalpayamount: item.amount,
          totaltax: details.tax,
          totalpureamount: item.wage,
        });
      }
    }
  }
}
