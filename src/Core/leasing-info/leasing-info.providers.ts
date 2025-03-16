import { Connection } from 'mongoose';
import { Provider } from '@vision/common';
import { leasingInfoSchema } from './schemas/leasing-info.schema';

export const leasingInfoProviders: Provider[] = [
  {
    provide: 'LeasingInfoModel',
    useFactory: (connection: Connection) => connection.model('LeasingInfo', leasingInfoSchema),
    inject: ['DbConnection'],
  },
];
