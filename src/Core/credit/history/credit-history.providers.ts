import { Connection } from 'mongoose';
import { CreditHistorySchema } from './schema/credit-history.schema';
import { CreditInstallmentsSchema } from './schema/installments.schema';

export const CreditHistoryProviders = [
  {
    provide: 'CreditHistoryModel',
    useFactory: (connection: Connection) => connection.model('CreditHistory', CreditHistorySchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'CreditInstallmentsModel',
    useFactory: (connection: Connection) => connection.model('CreditInstallments', CreditInstallmentsSchema),
    inject: ['DbConnection'],
  },
];
