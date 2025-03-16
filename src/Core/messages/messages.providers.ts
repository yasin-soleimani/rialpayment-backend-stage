import { Connection } from 'mongoose';
import { MessagesSchema } from './schema/messages.schema';

export const MessagesProviders = [
  {
    provide: 'MessagesModel',
    useFactory: (connection: Connection) => connection.model('messages', MessagesSchema),
    inject: ['DbConnection'],
  },
];
