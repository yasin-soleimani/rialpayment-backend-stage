import { Connection } from 'mongoose';
import { SendtoallSchema } from './schema/sendtoall.schema';

export const SendtoallProvides = [
  {
    provide: 'SendtoallModel',
    useFactory: (connection: Connection) => connection.model('Sendtoall', SendtoallSchema),
    inject: ['DbConnection'],
  },
];
