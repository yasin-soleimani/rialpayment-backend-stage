import { Connection } from 'mongoose';
import { CommentsSchema } from './schemas/comments.schema';

export const CommentsCoreProviders = [
  {
    provide: 'CommentsModel',
    useFactory: (connection: Connection) => connection.model('Comments', CommentsSchema),
    inject: ['DbConnection'],
  },
];
