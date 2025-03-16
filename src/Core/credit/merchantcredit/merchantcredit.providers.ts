import { Connection } from 'mongoose';
import { MerchanCreditSchema } from './schema/merchantcredit.schema';

export const merchantCreditProviders = [
  {
    provide: 'MerchantCreditModel',
    useFactory: (connection: Connection) => connection.model('MerchantCredit', MerchanCreditSchema),
    inject: ['DbConnection'],
  },
];
