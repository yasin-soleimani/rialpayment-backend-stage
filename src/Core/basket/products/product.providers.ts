import { Connection } from 'mongoose';
import { BasketProductSchema } from './schema/product.schema';
import { BasketProductCardFieldSchema } from './schema/product-card.schema';

export const BasketProductProviders = [
  {
    provide: 'BasketProductModel',
    useFactory: (connection: Connection) => connection.model('BasketProduct', BasketProductSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'BaksetProductCardFieldModel',
    useFactory: (connection: Connection) => connection.model('BaksetProductCardField', BasketProductCardFieldSchema),
    inject: ['DbConnection'],
  },
];
