import { Connection } from 'mongoose';
import { CheckoutSchema } from './schemas/checkout.schema';

export const CheckoutCoreProviders = [
  {
    provide: 'CheckoutModel',
    useFactory: (connection: Connection) => connection.model('Checkout', CheckoutSchema),
    inject: ['DbConnection'],
  },
];
