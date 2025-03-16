import { Connection } from 'mongoose';
import { BasketStoreSchema } from './schema/basket-store.schema';

export const BasketStoreProviders = [
  {
    provide: 'BasketStoreModel',
    useFactory: (connection: Connection) => connection.model('BasketStore', BasketStoreSchema),
    inject: ['DbConnection'],
  },
];
