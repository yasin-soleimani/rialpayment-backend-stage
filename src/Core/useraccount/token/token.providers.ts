import { Connection } from 'mongoose';
import { TokenSchema } from './schema/token.schema';

export const TokenProviders = [
  {
    provide: 'TokenModel',
    useFactory: (connection: Connection) => connection.model('Token', TokenSchema),
    inject: ['DbConnection'],
  },
];
