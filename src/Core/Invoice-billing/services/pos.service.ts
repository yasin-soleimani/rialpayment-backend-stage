import { Injectable, successOpt } from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { PspVerifyCoreInvoiceService } from '../../../Core/psp/pspverify/services/invoice.service';
import { CounterCoreService } from '../../../Core/counter/counter.service';
import { InvoiceBillingType } from '../const/invoice-type.const';
import { invoiceBillingDateRangeMonthFunc } from '../func/date.func';
import { InvoiceBillingCommonCoreService } from './common.service';
import { InvoiceBillingPercentCalc, InvoiceBillingPosDetailsFunc } from '../func/details-calc.func';

@Injectable()
export class InvoiceBillingPosCoreService {
  constructor(
    private readonly commonService: InvoiceBillingCommonCoreService,
    private readonly counterService: CounterCoreService,
    private readonly pspReportService: PspVerifyCoreInvoiceService
  ) {}

  async addNew(date): Promise<any> {
    const dateRange = invoiceBillingDateRangeMonthFunc(date);

    // Check Exist Data || Check duplicate
    const exist = await this.commonService.getData(InvoiceBillingType.Pos, dateRange.start, dateRange.end);
    if (exist) throw new UserCustomException('قبلا برای این ماه فاکتور صادر شده است', false, 500);

    this.makeInvoice(dateRange);

    return successOpt();
  }

  private async makeInvoice(dateRange): Promise<any> {
    const data = await this.pspReportService.getReport(dateRange.start, dateRange.end);
    for (const item of data) {
      if (item.total > 0 && item.wage > 0) {
        const invoiceid = await this.counterService.getNumber();
        const date = dateRange.end;
        const invoice = await this.commonService.addInvoice(item, invoiceid, InvoiceBillingType.Pos, date);
        // const title = 'تراکنش های کارتخوان فروشگاه ' + item._id.title + ' ار تاریخ 1398/01/01 الی 1398/12/29';

        const title =
          'تراکنش های کارتخوان فروشگاه ' + item._id.title + ' از تاریخ ' + dateRange.from + ' الی ' + dateRange.to;
        const details = InvoiceBillingPosDetailsFunc(item.companywage, item.agentwage);
        const unitPrice = InvoiceBillingPercentCalc(item.total, item.wage);

        await this.commonService.addDetails(item, details, 1, title, 'درصد', unitPrice, invoice._id);
        await this.commonService.updateDetails(invoice._id, {
          totalwage: item.wage,
          totalcompanywage: details.companywage,
          totalagentwage: details.agentwage,
          totalpayamount: item.amount,
          totaltax: details.tax,
          totalpureamount: details.companywage,
        });
      }
    }
  }
}
