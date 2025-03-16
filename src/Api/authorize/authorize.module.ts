import { Module } from '@vision/common';
import { AuthorizeClientCoreModule } from '../../Core/authorize/client/client.module';
import { AuthorizeApiController } from './authorize.controller';
import { AuthorizeApiService } from './authorize.service';
import { GeneralService } from '../../Core/service/general.service';

@Module({
  imports: [AuthorizeClientCoreModule],
  controllers: [AuthorizeApiController],
  providers: [AuthorizeApiService, GeneralService],
})
export class AuthorizeApiModule {}
