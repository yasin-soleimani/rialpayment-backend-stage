import { Injectable } from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { InvoiceBillingType } from './const/invoice-type.const';
import { invoiceBillingDateRangeMonthFunc } from './func/date.func';
import { InvoiceBillingClubCoreService } from './services/club.service';
import { InvoiceBillingCommonCoreService } from './services/common.service';
import { InvoiceBillingIpgCoreService } from './services/ipg.service';
import { InvoiceBillingPosCoreService } from './services/pos.service';
import { InvoiceBillingWebserviceCoreService } from './services/webservice.service';

@Injectable()
export class InvoiceBillingCoreService {
  constructor(
    private readonly posService: InvoiceBillingPosCoreService,
    private readonly ipgService: InvoiceBillingIpgCoreService,
    private readonly clubService: InvoiceBillingClubCoreService,
    private readonly webserviceService: InvoiceBillingWebserviceCoreService,
    private readonly commonService: InvoiceBillingCommonCoreService
  ) {}

  async makeInvoice(date, type: number): Promise<any> {
    switch (type) {
      case InvoiceBillingType.Club:
        return this.clubService.addNew(date);

      case InvoiceBillingType.Ipg:
        return this.ipgService.addNew(date);

      case InvoiceBillingType.Pos:
        return this.posService.addNew(date);

      case InvoiceBillingType.WebService:
        return this.webserviceService.addNew(date);

      default:
        throw new UserCustomException('نوع داده وارد شده نامعتبر', false, 500);
    }
  }

  async getList(page: number, type: number, date): Promise<any> {
    const dateRange = invoiceBillingDateRangeMonthFunc(date);
    return this.commonService.getList(page, type, dateRange.start, dateRange.end);
  }

  async cancelInvoice(id: string): Promise<any> {
    return this.commonService.cancelInvoice(id);
  }
}
