import { Module } from '@vision/common';
import { GeneralService } from '../../Core/service/general.service';
import { InvoiceBillingCoreModule } from '../../Core/Invoice-billing/billing.module';
import { BackofficeInvoiceController } from './invoice.controller';
import { BackofficeInvoiceService } from './invoice.service';

@Module({
  imports: [InvoiceBillingCoreModule],
  controllers: [BackofficeInvoiceController],
  providers: [BackofficeInvoiceService, GeneralService],
})
export class BackofficeInvoiceModule {}
