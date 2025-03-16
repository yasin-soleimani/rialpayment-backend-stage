import { Connection } from 'mongoose';
import { AccountSchema } from './schemas/cardcounter.schema';
import { AccountBlockSchema } from './schemas/blocked.schema';

export const AccountProviders = [
  {
    provide: 'AccountModel',
    useFactory: (connection: Connection) => connection.model('Account', AccountSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'AccountBlockModel',
    useFactory: (connection: Connection) => connection.model('AccountBlock', AccountBlockSchema),
    inject: ['DbConnection'],
  },
];
