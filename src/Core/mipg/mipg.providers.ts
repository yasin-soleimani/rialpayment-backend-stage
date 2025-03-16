import { Connection } from 'mongoose';
import { MipgSchema } from './schemas/mipg.schema';
import { PardakhtyariSchema } from './schemas/pardakhtyari.schema';
import { MipgAuthSchema } from './schemas/mipg-auth.schema';
import { MipgSharingSchema } from './schemas/mipg-sharing.schema';
import { MipgDirectSchema } from './schemas/mipg-direct.schema';
import { MipgVoucherSchema } from './schemas/mipg-voucher.schema';

export const MipgCoreProviders = [
  {
    provide: 'MipgModel',
    useFactory: (connection: Connection) => connection.model('Mipg', MipgSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'MipgPardakhtyariModel',
    useFactory: (connection: Connection) => connection.model('MipgPardakhtyari', PardakhtyariSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'MipgAuthModel',
    useFactory: (connection: Connection) => connection.model('MipgAuth', MipgAuthSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'MipgSharingModel',
    useFactory: (connection: Connection) => connection.model('MipgSharing', MipgSharingSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'MipgDirectModel',
    useFactory: (connection: Connection) => connection.model('MipgDirects', MipgDirectSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'MipgVoucherModel',
    useFactory: (connection: Connection) => connection.model('MipgVoucher', MipgVoucherSchema),
    inject: ['DbConnection'],
  },
];
