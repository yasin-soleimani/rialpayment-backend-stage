import { Module } from '@vision/common';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { BackofficeUsersController } from './users.controller';
import { BackofficeUsersService } from './users.service';
import { GeneralService } from '../../Core/service/general.service';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { LoggercoreModule } from '../../Core/logger/loggercore.module';
import { CheckoutSubmitCoreModule } from '../../Core/checkout/submit/checkoutsubmitcore.module';
import { SafevoucherCoreModule } from '../../Core/safevoucher/safevoucher.module';
import { IdentifyCoreModule } from '../../Core/useraccount/identify/identify.module';
import { MessagesCoreModule } from '../../Core/messages/messages.module';
import { BackofficeUsersSettingsController } from './controller/settings.controller';
import { BackofficeUsersSettingsService } from './services/settings.service';
import { SettingsCoreModule } from '../../Core/settings/settings.module';
import { BackofficeUsersAccountController } from './controller/block.controller';
import { BackofficeUsersAccountBlockService } from './services/users-account-block.service';
import { BackofficeVoucherUserService } from './services/voucher.service';
import { TicketsCoreModule } from '../../Core/tickets/tickets.module';
import { ClubCoreModule } from '../../Core/customerclub/club.module';
import { GroupCoreModule } from '../../Core/group/group.module';

@Module({
  imports: [
    UserModule,
    AccountModule,
    LoggercoreModule,
    CheckoutSubmitCoreModule,
    IdentifyCoreModule,
    MessagesCoreModule,
    SafevoucherCoreModule,
    SettingsCoreModule,
    TicketsCoreModule,
    ClubCoreModule,
    GroupCoreModule,
  ],
  controllers: [BackofficeUsersController, BackofficeUsersSettingsController, BackofficeUsersAccountController],
  providers: [
    BackofficeUsersService,
    BackofficeUsersSettingsService,
    BackofficeUsersAccountBlockService,
    BackofficeVoucherUserService,
    GeneralService,
  ],
})
export class BackofficeUsersModule {}
