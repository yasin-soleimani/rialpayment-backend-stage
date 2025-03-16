import { Connection } from 'mongoose';
import { CardmanagementSchema } from './schemas/cardmanagement.schema';

export const CardmanagementcoreProviders = [
  {
    provide: 'CardManagementModel',
    useFactory: (connection: Connection) => connection.model('CardManagement', CardmanagementSchema),
    inject: ['DbConnection'],
  },
];
