import { Connection } from 'mongoose';
import { PaymentLogsSchema } from './schema/paymentlogs.schema';

export const PaymentLogsProviders = [
  {
    provide: 'PaymentLogsModel',
    useFactory: (connection: Connection) => connection.model('PaymentLogs', PaymentLogsSchema),
    inject: ['DbConnection'],
  },
];
