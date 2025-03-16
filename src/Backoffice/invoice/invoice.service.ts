import { Injectable, InternalServerErrorException, successOpt, successOptWithPagination } from '@vision/common';
import { InvoiceBillingCoreService } from '../../Core/Invoice-billing/billing.service';

@Injectable()
export class BackofficeInvoiceService {
  constructor(private readonly invoiceService: InvoiceBillingCoreService) {}

  async makeInvoice(type: number, date): Promise<any> {
    return this.invoiceService.makeInvoice(date, type);
  }

  async cancelInvoice(id: string): Promise<any> {
    return this.invoiceService
      .cancelInvoice(id)
      .then((res) => {
        if (res) return successOpt();
        throw new InternalServerErrorException();
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }

  async getList(page: number, type: number, date): Promise<any> {
    const data = await this.invoiceService.getList(page, type, date);
    return successOptWithPagination(data);
  }
}
