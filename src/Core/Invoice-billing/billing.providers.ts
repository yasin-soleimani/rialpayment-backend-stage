import { Connection } from 'mongoose';
import { InvoiceSchema } from './schema/invoice-billing.details.schema';
import { InvoiceDetailsSchema } from './schema/invoice-details-billing.schema';

export const InvoiceBillingProviders = [
  {
    provide: 'InvoiceModel',
    useFactory: (connection: Connection) => connection.model('Invoice', InvoiceSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'InvoiceDetailsModel',
    useFactory: (connection: Connection) => connection.model('InvoiceDetails', InvoiceDetailsSchema),
    inject: ['DbConnection'],
  },
];
