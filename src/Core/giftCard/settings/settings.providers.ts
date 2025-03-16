import { Connection } from 'mongoose';
import { GiftCardSettingsSchema } from './schema/giftCardSettings.Schema';

export const GiftCardSettingsProviders = [
  {
    provide: 'GiftCardSettingsModel',
    useFactory: (connection: Connection) => connection.model('GiftCardSettings', GiftCardSettingsSchema),
    inject: ['DbConnection'],
  },
];
