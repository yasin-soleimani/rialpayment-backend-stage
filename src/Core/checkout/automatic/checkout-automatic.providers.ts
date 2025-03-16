import { Connection } from 'mongoose';
import { CheckoutAutomaticSchema } from './schema/checkout-automatic.schema';

export const CheckoutAutomaticProviders = [
  {
    provide: 'CheckoutAutomaticModel',
    useFactory: (connection: Connection) => connection.model('CheckoutAutomatic', CheckoutAutomaticSchema),
    inject: ['DbConnection'],
  },
];
