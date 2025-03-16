import { Connection } from 'mongoose';
import { TurnoverSchema } from './schema/turnover.schema';

export const TurnoverProviders = [
  {
    provide: 'TurnoverModel',
    useFactory: (connection: Connection) => connection.model('Turnover', TurnoverSchema),
    inject: ['DbConnection'],
  },
];
