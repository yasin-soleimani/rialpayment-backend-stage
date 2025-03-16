import { Connection } from 'mongoose';
import { BasketImagesSchema } from './schema/images.schema';

export const BasketImagesProviders = [
  {
    provide: 'BasketImagesModel',
    useFactory: (connection: Connection) => connection.model('BasketImage', BasketImagesSchema),
    inject: ['DbConnection'],
  },
];
