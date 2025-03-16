import { Connection } from 'mongoose';
import { SitadReqSchema } from './schema/sitad-req.schema';

export const SitadCoreProviders = [
  {
    provide: 'SitadReqModel',
    useFactory: (connection: Connection) => connection.model('SitadReq', SitadReqSchema),
    inject: ['DbConnection'],
  },
];
