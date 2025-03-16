import { Connection } from 'mongoose';
import { BasketCategorySchema } from './schema/category.schema';

export const BasketCategoryProviders = [
  {
    provide: 'BasketCategoryModel',
    useFactory: (connection: Connection) => connection.model('BasketCategory', BasketCategorySchema),
    inject: ['DbConnection'],
  },
];
