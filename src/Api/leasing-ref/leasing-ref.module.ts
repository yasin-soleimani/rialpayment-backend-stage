import { Module } from '@vision/common';
import { AclCoreModule } from '../../Core/acl/acl.module';
import { LeasingRefCoreModule } from '../../Core/leasing-ref/leasing-ref.module';
import { GeneralService } from '../../Core/service/general.service';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { LeasingRefController } from './leasing-ref.controller';
import { LeasingRefService } from './leasing-ref.service';
import { LeasingRefUtilsService } from './services/leasing-ref-utils.service';

@Module({
  imports: [LeasingRefCoreModule, AclCoreModule, UserModule],
  controllers: [LeasingRefController],
  providers: [LeasingRefService, GeneralService, LeasingRefUtilsService],
})
export class LeasingRefModule {}
