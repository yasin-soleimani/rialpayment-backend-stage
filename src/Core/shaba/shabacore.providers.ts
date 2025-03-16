import { Connection } from 'mongoose';
import { ShabacoreSchema } from './schemas/shabacore.schema';

export const ShabacoreProviders = [
  {
    provide: 'ShabaModel',
    useFactory: (connection: Connection) => connection.model('Shaba', ShabacoreSchema),
    inject: ['DbConnection'],
  },
];
