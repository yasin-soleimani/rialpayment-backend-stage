import { Connection } from 'mongoose';
import { ClubPwaSchema } from './schema/club-pwa.schema';

export const ClubPwaProvider = [
  {
    provide: 'ClubPwaModel',
    useFactory: (connection: Connection) => connection.model('Clubpwa', ClubPwaSchema),
    inject: ['DbConnection'],
  },
];
