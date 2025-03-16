import { Provider } from '@vision/common';
import { Connection } from 'mongoose';
import { LeasingContractSchema } from './schema/leasing-contract.schema';

export const leasingContractProviders: Provider[] = [
  {
    provide: 'LeasingContractModel',
    useFactory: (connection: Connection) => connection.model('leasingContract', LeasingContractSchema),
    inject: ['DbConnection'],
  },
];
