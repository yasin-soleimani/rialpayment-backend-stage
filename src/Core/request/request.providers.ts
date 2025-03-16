import { Connection } from 'mongoose';
import { RequestSchema } from './schema/request.schema';

export const RequestProviders = [
  {
    provide: 'RequestModel',
    useFactory: (connection: Connection) => connection.model('Request', RequestSchema),
    inject: ['DbConnection'],
  },
];
