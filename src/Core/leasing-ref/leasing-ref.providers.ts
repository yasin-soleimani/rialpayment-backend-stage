import { Provider } from '@vision/common';
import { Connection } from 'mongoose';
import { LeasingRefSchema } from './schemas/leasing-ref.schema';

export const leasingRefCoreProviders: Provider[] = [
  {
    provide: 'LeasingRefModel',
    useFactory: (connection: Connection) => connection.model('LeasingRef', LeasingRefSchema),
    inject: ['DbConnection'],
  },
];
