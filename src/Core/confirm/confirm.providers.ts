import { Connection } from 'mongoose';
import { ConfirmSchema } from './schema/confirm.schema';

export const ConfirmProviders = [
  {
    provide: 'ConfirmModel',
    useFactory: (connection: Connection) => connection.model('Confirm', ConfirmSchema),
    inject: ['DbConnection'],
  },
];
