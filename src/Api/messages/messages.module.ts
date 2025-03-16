import { Module } from '@vision/common';
import { MessagesCoreModule } from '../../Core/messages/messages.module';
import { MessagesApiController } from './messages.controller';
import { MessagesApiService } from './messages.service';
import { GeneralService } from '../../Core/service/general.service';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { SessionModule } from '../../Core/session/session.module';

@Module({
  imports: [MessagesCoreModule, UserModule, SessionModule],
  controllers: [MessagesApiController],
  providers: [MessagesApiService, GeneralService],
})
export class MessagesApiModule {}
