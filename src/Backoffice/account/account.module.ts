import { Module } from '@vision/common';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { BackofficeAccountController } from './account.controller';
import { BackofficeAccountService } from './account.service';
import { UserModule } from '../../Core/useraccount/user/user.module';

@Module({
  imports: [AccountModule, UserModule],
  controllers: [BackofficeAccountController],
  providers: [BackofficeAccountService],
  exports: [],
})
export class BackofficeAccountModule {}
