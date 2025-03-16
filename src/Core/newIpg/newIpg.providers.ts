import { Connection } from 'mongoose';
import { IpgSchema } from '../ipg/schemas/ipgcore.schema';
import { IpgListSchema } from '../ipg/schemas/ipg-lists.schema';
import { IpgMplSchema } from '../ipg/schemas/ipg-mpl.schema';

export const NewIpgCoreProviders = [
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
