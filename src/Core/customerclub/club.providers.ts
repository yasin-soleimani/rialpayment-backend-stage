import { Connection } from 'mongoose';
import { CLubSchema } from './schema/club.schema';

export const ClubProviders = [
  {
    provide: 'CustomerClubModel',
    useFactory: (connection: Connection) => connection.model('CustomerClub', CLubSchema),
    inject: ['DbConnection'],
  },
];
