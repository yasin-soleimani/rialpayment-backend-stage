import { Connection } from 'mongoose';
import { IdentifySchema } from './schema/identify.schema';
import { IdentifyRejectSchema } from './schema/reject.schema';
export const IdentifyProviders = [
  {
    provide: 'IdentifyModel',
    useFactory: (connection: Connection) => connection.model('UserIdentify', IdentifySchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'IdentifyRejectModel',
    useFactory: (connection: Connection) => connection.model('UserIdentifyReject', IdentifyRejectSchema),
    inject: ['DbConnection'],
  },
];
