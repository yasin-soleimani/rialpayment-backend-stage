import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { AuthorizeRequestCoreService } from './request.service';
import { AuthorizeRequestProviders } from './request.providers';

@Module({
  imports: [DatabaseModule],
  providers: [AuthorizeRequestCoreService, ...AuthorizeRequestProviders],
  exports: [AuthorizeRequestCoreService],
})
export class AuthorizeRequestCoreModule {}
