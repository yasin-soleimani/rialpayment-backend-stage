import { Connection } from 'mongoose';
import { HistorySchema } from './schema/history.schema';

export const HistoryProviders = [
  {
    provide: 'HistoryModel',
    useFactory: (connection: Connection) => connection.model('History', HistorySchema),
    inject: ['DbConnection'],
  },
];
