import { Injectable, successOpt } from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { CounterCoreService } from '../../../Core/counter/counter.service';
import { IpgCoreInvoiceService } from '../../../Core/ipg/services/common/invoice.service';
import { InvoiceBillingType } from '../const/invoice-type.const';
import { invoiceBillingDateRangeMonthFunc } from '../func/date.func';
import { InvoiceBillingDetailsFunc, InvoiceBillingPercentCalc } from '../func/details-calc.func';
import { InvoiceBillingCommonCoreService } from './common.service';

@Injectable()
export class InvoiceBillingIpgCoreService {
  constructor(
    private readonly counterService: CounterCoreService,
    private readonly commonService: InvoiceBillingCommonCoreService,
    private readonly ipgReportService: IpgCoreInvoiceService
  ) {}

  async addNew(date): Promise<any> {
    const dateRange = invoiceBillingDateRangeMonthFunc(date);

    // Check Exist Data || Check duplicate
    const exist = await this.commonService.getData(InvoiceBillingType.Ipg, dateRange.start, dateRange.end);
    if (exist) throw new UserCustomException('قبلا برای این ماه فاکتور صادر شده است', false, 500);

    this.makeInvoice(dateRange);

    return successOpt();
  }

  private async makeInvoice(dateRange): Promise<any> {
    const date = dateRange.end;
    const data = await this.ipgReportService.getReport(dateRange.start, dateRange.end);
    for (const item of data) {
      if (item.total > 0 && item.wage > 0) {
        const invoiceid = await this.counterService.getNumber();

        const invoice = await this.commonService.addInvoice(item, invoiceid, InvoiceBillingType.Ipg, date);

        const title =
          ' تراکنش های فروشگاه اینترنتی ' + item._id.title + ' از تاریخ ' + dateRange.from + ' الی ' + dateRange.to;
        // const title = 'تراکنش های فروشگاه اینترنتی ' + item._id.title + ' ار تاریخ 1398/01/01 الی 1398/12/29';

        const details = InvoiceBillingDetailsFunc(item);
        const unitPrice = InvoiceBillingPercentCalc(item.total, item.wage);

        await this.commonService.addDetails(item, details, 1, title, 'درصد', unitPrice, invoice._id);
        await this.commonService.updateDetails(invoice._id, {
          totalwage: item.wage,
          totalcompanywage: details.companywage,
          totalagentwage: details.agentwage,
          totalpayamount: item.amount,
          totaltax: details.tax,
          totalpureamount: details.companywage + details.tax,
        });
      }
    }
  }
}
