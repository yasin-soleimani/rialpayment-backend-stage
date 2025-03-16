import { Connection } from 'mongoose';
import { Provider } from '@vision/common';
import { leasingOptionSchema } from './schemas/leasing-option.schema';

export const leasingOptionProviders: Provider[] = [
  {
    provide: 'LeasingOptionModel',
    useFactory: (connection: Connection) => connection.model('LeasingOption', leasingOptionSchema),
    inject: ['DbConnection'],
  },
];
