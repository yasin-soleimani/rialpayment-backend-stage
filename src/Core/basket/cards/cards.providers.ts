import { Connection } from 'mongoose';
import { BasketCardsSchema } from './schema/cards.schema';

export const BasketProductCardProviders = [
  {
    provide: 'BasketCardsModel',
    useFactory: (connection: Connection) => connection.model('BasketCards', BasketCardsSchema),
    inject: ['DbConnection'],
  },
];
