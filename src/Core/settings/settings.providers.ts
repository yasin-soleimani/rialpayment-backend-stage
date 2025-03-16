import { Connection } from 'mongoose';
import { SettingsClubSchema } from './schema/club-settings.schema';
import { SettingsSchema } from './schema/settings.schema';
import { AgentsSettingsSchema } from './schema/agents-settings.schema';
import { UserSettingsSchema } from './schema/user-settings.schema';
import { UserDeveloperSchema } from './schema/developer.schema';

export const SettingsProviders = [
  {
    provide: 'SettingsModel',
    useFactory: (connection: Connection) => connection.model('Settings', SettingsSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'SettingsClubModel',
    useFactory: (connection: Connection) => connection.model('SettingsClub', SettingsClubSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'SettingsAgentModel',
    useFactory: (connection: Connection) => connection.model('SettingsAgent', AgentsSettingsSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'SettingsUserModel',
    useFactory: (connection: Connection) => connection.model('SettingsUser', UserSettingsSchema),
    inject: ['DbConnection'],
  },
  {
    provide: 'SettingsDeveloperModel',
    useFactory: (connection: Connection) => connection.model('SettingsUserDeveloper', UserDeveloperSchema),
    inject: ['DbConnection'],
  },
];
