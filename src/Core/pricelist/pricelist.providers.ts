import { Connection } from 'mongoose';
import { PricelistSchema } from './schema/pricelist.schema';
import { PriceListDetailsSchema } from './schema/pricelist-details.schema';

export const PricelistProviders = [
  {
    provide: 'PricelistModel',
    useFactory: (connection: Connection) => connection.model('Pricelist', PricelistSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'PricelistDetailsModel',
    useFactory: (connection: Connection) => connection.model('PricelistDetails', PriceListDetailsSchema),
    inject: ['DbConnection'],
  },
];
