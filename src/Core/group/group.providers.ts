import { Connection } from 'mongoose';
import { GroupSchema } from './schema/group.schema';
import { GroupUserSchema } from './schema/group-user.schema';
import { GroupDetailSchema } from './schema/group-detail.schema';
import { GroupChargeHistorySchema } from './schema/group-charge-history.schema';

export const GroupCoreProviders = [
  {
    provide: 'GroupModel',
    useFactory: (connection: Connection) => connection.model('Group', GroupSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'GroupUserModel',
    useFactory: (connection: Connection) => connection.model('GroupUser', GroupUserSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'GroupChargeHistoryModel',
    useFactory: (connection: Connection) => connection.model('GroupChargeHistory', GroupChargeHistorySchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'GroupDetailsModel',
    useFactory: (connection: Connection) => connection.model('GroupDetails', GroupDetailSchema),
    inject: ['DbConnection'],
  },
];
