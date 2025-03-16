import { Connection } from 'mongoose';
import { SubmitSchema } from './schemas/submit.schema';

export const CheckoutSubmitCoreProviders = [
  {
    provide: 'SubmitModel',
    useFactory: (connection: Connection) => connection.model('Submit', SubmitSchema),
    inject: ['DbConnection'],
  },
];
