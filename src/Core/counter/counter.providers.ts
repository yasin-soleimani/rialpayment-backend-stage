import { Connection } from 'mongoose';
import { CounterSchema } from './schema/counter.schema';

export const CounterProviders = [
  {
    provide: 'CounterModel',
    useFactory: (connection: Connection) => connection.model('Counter', CounterSchema),
    inject: ['DbConnection'],
  },
];
