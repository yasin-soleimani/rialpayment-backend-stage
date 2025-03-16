import { Connection } from 'mongoose';
import { GroupReportSchema } from './schema/transacrion-report.schema';

export const TransactionReportProviders = [
  {
    provide: 'TransactionReportModel',
    useFactory: (connection: Connection) => connection.model('TransactionReport', GroupReportSchema),
    inject: ['DbConnection'],
  },
];
