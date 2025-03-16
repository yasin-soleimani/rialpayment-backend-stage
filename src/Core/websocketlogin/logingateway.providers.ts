import { Connection } from 'mongoose';
import { SocketSchema } from './schemas/logingateway.schema';

export const LoginGatewayCoreProviders = [
  {
    provide: 'SocketModel',
    useFactory: (connection: Connection) => connection.model('Socket', SocketSchema),
    inject: ['DbConnection'],
  },
];
