import { Module } from '@vision/common';
import { MipgCoreService } from './mipg.service';
import { MipgCoreProviders } from './mipg.providers';
import { DatabaseModule } from '../../Database/database.module';
import { CategorycoreService } from '../category/categorycore.service';
import { CategorycoreProviders } from '../category/categorycore.providers';
import { MipgPardakhtyariService } from './services/pardakhtyari';
import { MipgAuthService } from './services/mipg-auth.service';
import { MipgSharingService } from './services/mipg-sharing.service';
import { MipgDirectCoreService } from './services/mipg-direct.service';
import { MipgVoucherCoreService } from './services/mipg-voucher.service';
import { AclCoreModule } from '../acl/acl.module';
import { UserModule } from '../useraccount/user/user.module';

@Module({
  imports: [DatabaseModule, AclCoreModule, UserModule],
  controllers: [],
  providers: [
    MipgCoreService,
    MipgPardakhtyariService,
    MipgAuthService,
    MipgSharingService,
    MipgDirectCoreService,
    MipgVoucherCoreService,
    CategorycoreService,
    ...MipgCoreProviders,
    ...CategorycoreProviders,
  ],
  exports: [
    MipgCoreService,
    MipgPardakhtyariService,
    MipgSharingService,
    MipgDirectCoreService,
    MipgVoucherCoreService,
    MipgAuthService,
  ],
})
export class MipgModule {}
