import { Module } from '@vision/common';
import { UserModule } from '../useraccount/user/user.module';
import { EditCoreService } from './edit.service';
import { CardModule } from '../useraccount/card/card.module';
import { AccountModule } from '../useraccount/account/account.module';
import { GroupCoreModule } from '../group/group.module';
import { MerchantcoreModule } from '../merchant/merchantcore.module';

@Module({
  imports: [UserModule, CardModule, AccountModule, GroupCoreModule, MerchantcoreModule],
  providers: [EditCoreService],
  exports: [EditCoreService],
})
export class EditCoreModule {}
