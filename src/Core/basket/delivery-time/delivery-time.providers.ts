import { Connection } from 'mongoose';
import { Provider } from '@vision/common';
import { BasketDeliveryTimeSchema } from './schemas/delivery-time.schema';

export const deliveryTimeProviders: Provider[] = [
  {
    provide: 'BasketDeliveryTimeModel',
    useFactory: (connection: Connection) => connection.model('BasketDeliveryTime', BasketDeliveryTimeSchema),
    inject: ['DbConnection'],
  },
];
