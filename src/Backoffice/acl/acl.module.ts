import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { AclBackOfficeController } from './acl.controller';
import { AclCoreService } from '../../Core/acl/acl.service';
import { AclProviders } from '../../Core/acl/acl.providers';
import { AclBackOfficeService } from './acl.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AclBackOfficeController],
  providers: [AclCoreService, AclBackOfficeService, ...AclProviders],
})
export class BackofficeAclModule {}
