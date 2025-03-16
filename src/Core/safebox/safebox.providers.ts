import { Connection } from 'mongoose';
import { SafeboxSchema } from './schema/safebox.schema';

export const SafeboxProviders = [
  {
    provide: 'SafeboxModel',
    useFactory: (connection: Connection) => connection.model('Safebox', SafeboxSchema),
    inject: ['DbConnection'],
  },
];
