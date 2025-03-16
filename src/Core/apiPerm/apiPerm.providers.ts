import { Connection } from 'mongoose';
import { ApiPermSchema } from './schemas/apiPerm.schema';

export const ApiPermProviders = [
  {
    provide: 'ApiPermModel',
    useFactory: (connection: Connection) => connection.model('ApiPerm', ApiPermSchema),
    inject: ['DbConnection'],
  },
];
