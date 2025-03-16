import { Connection } from 'mongoose';
import { OrganizationNewChargeSchema } from './schema/charge.schema';

export const OrganizationNewChargeProviders = [
  {
    provide: 'OrganizationNewChargeModel',
    useFactory: (connection: Connection) => connection.model('OrganizationNewCharge', OrganizationNewChargeSchema),
    inject: ['DbConnection'],
  },
];
