import { Provider } from '@vision/common';
import { Connection } from 'mongoose';
import { BasketProductOptionSchema } from './schemas/product-option.schema';

export const BasketProductOptionProviders: Provider[] = [
  {
    provide: 'BasketProductOptionModel',
    useFactory: (connection: Connection) => connection.model('BasketProductOption', BasketProductOptionSchema),
    inject: ['DbConnection'],
  },
];
