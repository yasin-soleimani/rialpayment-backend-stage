import { Connection } from 'mongoose';
import { SimcardSchema } from './schema/simcard.schema';

export const SimcardProviders = [
  {
    provide: 'SimcardModel',
    useFactory: (connection: Connection) => connection.model('Simcard', SimcardSchema),
    inject: ['DbConnection'],
  },
];
