import { Connection } from 'mongoose';
import { StoreSchema } from './schemas/store.schema';

export const StoreProviders = [
  {
    provide: 'StoreModel',
    useFactory: (connection: Connection) => connection.model('Store', StoreSchema),
    inject: ['DbConnection'],
  },
];
