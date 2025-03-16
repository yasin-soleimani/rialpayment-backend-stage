import { Connection } from 'mongoose';
import { PspipCoreSchema } from './schemas/pspipCore.schema';

export const PspipCoreProviders = [
  {
    provide: 'PspipModel',
    useFactory: (connection: Connection) => connection.model('Pspip', PspipCoreSchema),
    inject: ['DbConnection'],
  },
];
