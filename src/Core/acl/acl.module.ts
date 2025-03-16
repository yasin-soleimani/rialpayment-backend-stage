import { Module } from '@vision/common';
import { AclCoreService } from './acl.service';
import { AclProviders } from './acl.providers';
import { DatabaseModule } from '../../Database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [AclCoreService, ...AclProviders],
  exports: [AclCoreService],
})
export class AclCoreModule {}
