import { Connection } from 'mongoose';
import { BanksSchema } from './schema/banks.schema';

export const BanksProviders = [
  {
    provide: 'BankModel',
    useFactory: (connection: Connection) => connection.model('Bank', BanksSchema),
    inject: ['DbConnection'],
  },
];
