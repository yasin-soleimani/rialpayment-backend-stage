import { Connection } from 'mongoose';
import { IpgSchema } from './schemas/ipgcore.schema';
import { IpgListSchema } from './schemas/ipg-lists.schema';
import { IpgMplSchema } from './schemas/ipg-mpl.schema';

export const IpgCoreProviders = [
  {
    provide: 'IpgModel',
    useFactory: (connection: Connection) => connection.model('Ipg', IpgSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'IpgListModel',
    useFactory: (connection: Connection) => connection.model('IpgList', IpgListSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'IpgMplModel',
    useFactory: (connection: Connection) => connection.model('IpgMpl', IpgMplSchema),
    inject: ['DbConnection'],
  },
];
