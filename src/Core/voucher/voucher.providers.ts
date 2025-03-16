import { Connection } from 'mongoose';
import { VoucherSchema } from './schema/voucher.schema';
import { VoucherListSchema } from './schema/voucher-list.schema';
import { VoucherDetailsSchema } from './schema/voucher-details.schema';

export const VoucherProviders = [
  {
    provide: 'VoucherModel',
    useFactory: (connection: Connection) => connection.model('Voucher', VoucherSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'VoucherListModel',
    useFactory: (connection: Connection) => connection.model('VoucherList', VoucherListSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'VoucherDetailsModel',
    useFactory: (connection: Connection) => connection.model('VoucherDetails', VoucherDetailsSchema),
    inject: ['DbConnection'],
  },
];
