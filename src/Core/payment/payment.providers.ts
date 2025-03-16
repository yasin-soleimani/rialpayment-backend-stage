import { Connection } from 'mongoose';
import { PaymentSchema } from './schemas/payment.schema';

export const PaymentProviders = [
  {
    provide: 'PaymentModel',
    useFactory: (connection: Connection) => connection.model('Payment', PaymentSchema),
    inject: ['DbConnection'],
  },
];
