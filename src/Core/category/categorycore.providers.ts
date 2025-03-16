import { Connection } from 'mongoose';
import { CategorySchema } from './schemas/category.schemas';

export const CategorycoreProviders = [
  {
    provide: 'CategoryModel',
    useFactory: (connection: Connection) => connection.model('Category', CategorySchema),
    inject: ['DbConnection'],
  },
];
