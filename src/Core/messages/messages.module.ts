import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { MessagesCoreService } from './messages.service';
import { MessagesProviders } from './messages.providers';

@Module({
  imports: [DatabaseModule],
  providers: [MessagesCoreService, ...MessagesProviders],
  exports: [MessagesCoreService],
})
export class MessagesCoreModule {}
