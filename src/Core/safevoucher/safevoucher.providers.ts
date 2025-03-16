import { Connection } from 'mongoose';
import { SafeVoucherSchema } from './schema/safevoucher.schema';

export const SafeVoucherProviders = [
  {
    provide: 'SafeVoucherModel',
    useFactory: (connection: Connection) => connection.model('SafeVoucher', SafeVoucherSchema),
    inject: ['DbConnection'],
  },
];
