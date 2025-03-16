import { Connection } from 'mongoose';
import { NationalSchema } from './schema/national.schema';
import { NationalDocsSchema } from './schema/national-docs.schema';

export const NationalProviders = [
  {
    provide: 'NationalModel',
    useFactory: (connection: Connection) => connection.model('National', NationalSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'NationalDocsModel',
    useFactory: (connection: Connection) => connection.model('NationalDocs', NationalDocsSchema),
    inject: ['DbConnection'],
  },
];
