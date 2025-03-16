import { Connection } from 'mongoose';
import { AuthorizeUserSchema } from './schema/user.schema';
import { AuthorizeUserWageSchema } from './schema/user-wage.schema';

export const AuthorizeUserProviders = [
  {
    provide: 'AuthorizeUserModel',
    useFactory: (connection: Connection) => connection.model('AuthorizeUser', AuthorizeUserSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'AuthorizeUserWageModel',
    useFactory: (connection: Connection) => connection.model('AuthorizeUserWage', AuthorizeUserWageSchema),
    inject: ['DbConnection'],
  },
];
