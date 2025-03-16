import { Connection } from 'mongoose';
import { CardcounterSchema } from './schemas/cardcounter.schema';

export const CardcounterProviders = [
  {
    provide: 'CardCounterModel',
    useFactory: (connection: Connection) => connection.model('CardCounter', CardcounterSchema),
    inject: ['DbConnection'],
  },
];
