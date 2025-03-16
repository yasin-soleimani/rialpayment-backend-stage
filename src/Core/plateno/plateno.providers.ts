import { Connection } from 'mongoose';
import { PlatnoSchema } from './schema/platno.schema';

export const PlatnoProviders = [
  {
    provide: 'PlatnoModel',
    useFactory: (connection: Connection) => connection.model('Platno', PlatnoSchema),
    inject: ['DbConnection'],
  },
];
