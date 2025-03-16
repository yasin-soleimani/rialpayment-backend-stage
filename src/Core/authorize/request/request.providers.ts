import { Connection } from 'mongoose';
import { AuthorizeRequestSchema } from './schema/request.schema';

export const AuthorizeRequestProviders = [
  {
    provide: 'AuthorizeRequestModel',
    useFactory: (connection: Connection) => connection.model('AuthorizeRequest', AuthorizeRequestSchema),
    inject: ['DbConnection'],
  },
];
