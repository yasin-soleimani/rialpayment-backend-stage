import { Connection } from 'mongoose';
import { Provider } from '@vision/common';
import { TaxiSchema } from './schemas/taxi.schema';

export const taxiProviders: Provider[] = [
  {
    provide: 'TaxiModel',
    useFactory: (connection: Connection) => connection.model('Taxi', TaxiSchema),
    inject: ['DbConnection'],
  },
];
