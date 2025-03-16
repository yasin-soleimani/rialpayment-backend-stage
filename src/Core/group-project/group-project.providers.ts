import { Connection } from 'mongoose';
import { GroupProjectSchema } from './schema/group-project.schema';
import { GroupProjectUsersSchema } from './schema/group-project-user.schema';
import { GroupProjectTargetSchema } from './schema/gruop-target.schema';

export const GroupProjectProviders = [
  {
    provide: 'GroupProjectModel',
    useFactory: (connection: Connection) => connection.model('GroupProject', GroupProjectSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'GroupProjectUserModel',
    useFactory: (connection: Connection) => connection.model('GroupProjectUser', GroupProjectUsersSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'GroupProjectTargetModel',
    useFactory: (connection: Connection) => connection.model('GroupProjectTarget', GroupProjectTargetSchema),
    inject: ['DbConnection'],
  },
];
