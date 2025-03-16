import { Connection } from 'mongoose';
import { GiftCardReportSchema } from './schema/report.schema';

export const GiftCardReportProviders = [
  {
    provide: 'GiftCardReportModel',
    useFactory: (connection: Connection) => connection.model('GiftCardReport', GiftCardReportSchema),
    inject: ['DbConnection'],
  },
];
