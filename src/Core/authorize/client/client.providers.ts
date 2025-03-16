import { Connection } from 'mongoose';
import { AuthorizeClientSchema } from './schema/client.schema';

export const AuthorizeClientProviders = [
  {
    provide: 'AuthorizeClientModel',
    useFactory: (connection: Connection) => connection.model('AuthorizeClient', AuthorizeClientSchema),
    inject: ['DbConnection'],
  },
];
