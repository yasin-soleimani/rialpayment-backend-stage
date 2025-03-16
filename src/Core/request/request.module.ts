import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { RequestCoreService } from './request.service';
import { RequestProviders } from './request.providers';

@Module({
  imports: [DatabaseModule],
  providers: [RequestCoreService, ...RequestProviders],
  exports: [RequestCoreService],
})
export class RequestCoreModule {}
