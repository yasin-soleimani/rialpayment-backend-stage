import { Connection } from 'mongoose';
import { WageSystemSchema } from './schema/wage-system.schema';

export const WageSystemProviders = [
  {
    provide: 'WageSystemModel',
    useFactory: (connection: Connection) => connection.model('WageSystem', WageSystemSchema),
    inject: ['DbConnection'],
  },
];
