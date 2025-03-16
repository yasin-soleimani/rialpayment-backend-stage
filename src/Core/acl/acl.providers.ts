import { Connection } from 'mongoose';
import { AclSchema } from './schemas/acl.schema';

export const AclProviders = [
  {
    provide: 'AclModel',
    useFactory: (connection: Connection) => connection.model('Acl', AclSchema),
    inject: ['DbConnection'],
  },
];
