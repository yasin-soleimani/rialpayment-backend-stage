import { Connection } from 'mongoose';
import { LoggerSchema } from './schemas/loggercore.schema';

export const LoggercoreProviders = [
  {
    provide: 'LoggerModel',
    useFactory: (connection: Connection) => connection.model('Logger', LoggerSchema),
    inject: ['DbConnection'],
  },
];
