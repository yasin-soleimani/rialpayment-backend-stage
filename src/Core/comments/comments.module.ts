import { Module } from '@vision/common';

import { DatabaseModule } from '../../Database/database.module';
import { CommentsCoreService } from './comments.service';
import { CommentsCoreProviders } from './comments.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [CommentsCoreService, ...CommentsCoreProviders],
})
export class CommentsCoreModule {}
