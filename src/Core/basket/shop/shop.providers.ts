import { Connection } from 'mongoose';
import { BasketShopSchema } from './schema/shop.schema';
import { BasketAddressSchema } from './schema/address.schema';

export const BasketShopProviders = [
  {
    provide: 'BasketShopModel',
    useFactory: (connection: Connection) => connection.model('BasketShop', BasketShopSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'BasketAddressModel',
    useFactory: (connection: Connection) => connection.model('BasketAddress', BasketAddressSchema),
    inject: ['DbConnection'],
  },
];
