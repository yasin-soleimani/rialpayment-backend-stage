import { Connection } from 'mongoose';
import { DispatcheruserSchema } from './schema/dispatcher.schema';
import { DispatchermerchantSchema } from './schema/dispatcher-merchants.schema';
import { DispatcherCardsSchema } from './schema/dispatcher-cards.schema';
import { DispatcherbinSchema } from './schema/dispatcher-bin.schema';

export const DispatcherCoreProviders = [
  {
    provide: 'DispatcheruserModel',
    useFactory: (connection: Connection) => connection.model('Dispatcheruser', DispatcheruserSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'DispatchermerchantModel',
    useFactory: (connection: Connection) => connection.model('Dispatchermerchant', DispatchermerchantSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'DispatchercardsModel',
    useFactory: (connection: Connection) => connection.model('Dispatchercards', DispatcherCardsSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'DispatcherbinModel',
    useFactory: (connection: Connection) => connection.model('Dispatcherbin', DispatcherbinSchema),
    inject: ['DbConnection'],
  },
];
