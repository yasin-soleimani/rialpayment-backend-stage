import { Connection } from 'mongoose';
import { SessionSchema } from './schema/session.schema';

export const SessionProvides = [
  {
    provide: 'SessionModel',
    useFactory: (connection: Connection) => connection.model('Session', SessionSchema),
    inject: ['DbConnection'],
  },
];
