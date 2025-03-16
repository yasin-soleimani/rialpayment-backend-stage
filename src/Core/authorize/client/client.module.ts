import { Module } from '@vision/common';
import { DatabaseModule } from '../../../Database/database.module';
import { AuthorizeClientCoreService } from './client.service';
import { AuthorizeClientProviders } from './client.providers';

@Module({
  imports: [DatabaseModule],
  providers: [AuthorizeClientCoreService, ...AuthorizeClientProviders],
  exports: [AuthorizeClientCoreService],
})
export class AuthorizeClientCoreModule {}
