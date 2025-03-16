import { Connection } from 'mongoose';
import { OrganizationChargeSchema } from './schema/organization-charge.schema';

export const OrganizationChargeProviders = [
  {
    provide: 'OrganizationChargeModel',
    useFactory: (connection: Connection) => connection.model('OrganizationCharge', OrganizationChargeSchema),
    inject: ['DbConnection'],
  },
];
