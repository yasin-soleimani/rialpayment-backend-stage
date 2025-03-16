import { Connection } from 'mongoose';
import { OrganizationStrategySchema } from './schema/organization-strategy.schema';

export const OrganizationStrategyProviders = [
  {
    provide: 'OrganizationStrategyModel',
    useFactory: (connection: Connection) => connection.model('OrganizationStrategy', OrganizationStrategySchema),
    inject: ['DbConnection'],
  },
];
