import { Connection } from 'mongoose';
import { OrganizationPoolTurnOverSchema } from './schema/pool-turnover.schema';
import { OrganizationPoolSchema } from './schema/pool.schema';
import { OrganizationPoolHistorySchema } from './schema/pool-history.schema';

export const OrganizationPoolProviders = [
  {
    provide: 'OrganizationPoolModel',
    useFactory: (connection: Connection) => connection.model('OrganizationPool', OrganizationPoolSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'OrganizationPoolPoolTurnModel',
    useFactory: (connection: Connection) =>
      connection.model('OrganizationPoolTurnOver', OrganizationPoolTurnOverSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'OrganizationPoolHistoryModel',
    useFactory: (connection: Connection) => connection.model('OrganizationPoolHistory', OrganizationPoolHistorySchema),
    inject: ['DbConnection'],
  },
];
