import { Connection } from 'mongoose';
import { ShaparakSettlementSchema } from './schema/settlement.schema';

export const ShaparakSettlementProviders = [
  {
    provide: 'ShaparakSettlementModel',
    useFactory: (connection: Connection) => connection.model('ShaparakSettlement', ShaparakSettlementSchema),
    inject: ['DbConnection'],
  },
];
