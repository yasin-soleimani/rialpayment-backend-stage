import { Connection } from 'mongoose';
import { UserCreditSchema } from './schema/user-credit.schema';

export const UserCreditCoreProviders = [
  {
    provide: 'UserCreditModel',
    useFactory: (connection: Connection) => connection.model('UserCredit', UserCreditSchema),
    inject: ['DbConnection'],
  },
];
