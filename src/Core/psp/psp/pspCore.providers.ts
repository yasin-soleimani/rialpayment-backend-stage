import { Connection } from 'mongoose';
import { PspCoreSchema } from './schemas/pspCore.schema';

export const PspCoreProviders = [
  {
    provide: 'PspModel',
    useFactory: (connection: Connection) => connection.model('Psp', PspCoreSchema),
    inject: ['DbConnection'],
  },
];
