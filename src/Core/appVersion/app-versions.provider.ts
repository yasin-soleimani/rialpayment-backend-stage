import { Connection } from 'mongoose';
import { AppVersionsSchema } from './schemas/app-versions.schema';

export const AppVersionsProvider = [
  {
    provide: 'AppVersions',
    useFactory: (connection: Connection) => connection.model('appversions', AppVersionsSchema),
    inject: ['DbConnection'],
  },
];
