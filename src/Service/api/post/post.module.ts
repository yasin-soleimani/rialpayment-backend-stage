import { Module } from '@vision/common';
import { PostController } from './post.controller';
import { PostApiService } from './post.service';
import { ApiPermCoreModule } from '../../../Core/apiPerm/apiPerm.module';
import { AccountModule } from '../../../Core/useraccount/account/account.module';
import { RequestCoreModule } from '../../../Core/request/request.module';

@Module({
  imports: [ApiPermCoreModule, AccountModule, RequestCoreModule],
  controllers: [PostController],
  providers: [PostApiService],
})
export class PostServiceModule {}
