import { Connection } from 'mongoose';
import { LoginHistorySchema } from '../useraccount/history/schema/login-history.schema';
import { CampaignSchema } from './schema/campaign.schema';

export const CampaignProviders = [
  {
    provide: 'CampaignModel',
    useFactory: (connection: Connection) => connection.model('Campaign', CampaignSchema),
    inject: ['DbConnection'],
  }, {
    provide: 'LoginHistoryModel',
    useFactory: (connection: Connection) => connection.model('LoginHistory', LoginHistorySchema),
    inject: ['DbConnection'],
  },
];
