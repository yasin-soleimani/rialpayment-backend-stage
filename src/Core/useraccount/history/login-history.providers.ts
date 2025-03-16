import { Connection } from 'mongoose';
import { LoginHistorySchema } from './schema/login-history.schema';

export const LoginHistoryProviders = [
  {
    provide: 'LoginHistoryModel',
    useFactory: (connection: Connection) => connection.model('LoginHistory', LoginHistorySchema),
    inject: ['DbConnection'],
  },
];
