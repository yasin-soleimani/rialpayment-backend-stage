import { Module } from '@vision/common';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { AuthorizeAccountServiceController } from './account.controller';
import { AuthorizeAccountService } from './account.service';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { AuthorizeClientCoreModule } from '../../Core/authorize/client/client.module';
import { AuthorizeUserCoreModule } from '../../Core/authorize/user/user.module';
import { AuthorizeAccountLoginService } from './services/account-login.service';
import { AuthorizeAccountWalletService } from './services/account-wallet.service';
import { AuthorizeRequestCoreModule } from '../../Core/authorize/request/request.module';
import { AuthorizeAccountTokenService } from './services/account-get-token.service';

@Module({
  imports: [AccountModule, UserModule, AuthorizeClientCoreModule, AuthorizeUserCoreModule, AuthorizeRequestCoreModule],
  controllers: [AuthorizeAccountServiceController],
  providers: [
    AuthorizeAccountService,
    AuthorizeAccountLoginService,
    AuthorizeAccountWalletService,
    AuthorizeAccountTokenService,
  ],
})
export class AuthorizeAccountServiceModule {}
