import { Connection } from 'mongoose';
import { Provider } from '@vision/common';
import { LeasingApplySchema } from './schema/leasing-apply.schema';

export const leasingApplyProviders: Provider[] = [
  {
    provide: 'LeasingApplyModel',
    useFactory: (connection: Connection) => connection.model('LeasingApply', LeasingApplySchema),
    inject: ['DbConnection'],
  },
];
