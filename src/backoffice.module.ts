import { Module } from '@vision/common';
import { BackofficeAuthModule } from './Backoffice/auth/auth.module';
import { BackofficeUsersModule } from './Backoffice/users/users.module';
import { BackofficeAccountModule } from './Backoffice/account/account.module';
import { BackofficeCardModule } from './Backoffice/card/card.module';
import { BackofficeHistoryModule } from './Backoffice/history/history.module';
import { APP_GUARD } from '@vision/core';
import { RolesGuard } from './Guard/roles.guard';
import { BackofficeAclModule } from './Backoffice/acl/acl.module';
import { BackofficeReportModule } from './Backoffice/report/report.module';
import { BackofficeDashboardModule } from './Backoffice/dashboard/dashboard.module';
import { PspModule } from './Backoffice/psp/psp.module';
import { BackofficeIdentifyModule } from './Backoffice/identify/identify.module';
import { BackofficeAuthorizeModule } from './Backoffice/authorize/authorize.module';
import { BackofficeAccountBlockModule } from './Backoffice/account-block/account-block.module';
import { BackofficeCheckoutSettingsModule } from './Backoffice/checkout/checkout.module';
import { BackofficeWageModule } from './Backoffice/wage/wage.module';
import { CashoutBackofficeModule } from './Backoffice/cashout/cashout.module';
import { BackofficeCreditorModule } from './Backoffice/creditor/creditor.module';
import { BackofficeGroupsModule } from './Backoffice/groups/groups.module';
import { BackofficeSimcardModule } from './Backoffice/simcard/simcard.module';
import { BackofficeInvoiceModule } from './Backoffice/invoice/invoice.module';
import { BackofficePoolModule } from './Backoffice/pool/pool.module';
import { BackOfficeSendToAllModule } from './Backoffice/sendtoall/sendtoall.module';
import { BackofficeCampaignModule } from './Backoffice/campaign/campaign.module';
import { BackofficeMipgModule } from './Backoffice/new-mipg/backoffice-mipg.module';
import { BackofficeLeasingRefModule } from './Backoffice/leasing-ref/leasing-ref.module';
import { TokenModule } from './Core/useraccount/token/token.module';
import { BackofficeGiftcardModule } from './Backoffice/giftcard/giftcard.module';
import { BackofficePosManagementModule } from './Backoffice/pos-management/pos-management.module';
import { BackofficeLeasingApplyModule } from './Backoffice/leasing-apply/leasing-apply.module';
import { BackofficeLeasingInstallmentsModule } from './Backoffice/leasing-installments/leasing-installments.module';
import { BackofficeMerchantPspModule } from './Backoffice/merchant-psp/merchant-psp.module';
import { MerchantModule } from './Backoffice/merchant/merchant.module';
import { BackOfficeAppVersionModule } from './Backoffice/appVersions/appVersion.module';

@Module({
  imports: [
    TokenModule,
    BackOfficeSendToAllModule,
    BackofficeSimcardModule,
    BackofficeGroupsModule,
    BackofficeCreditorModule,
    BackofficeWageModule,
    BackofficeAuthModule,
    BackofficeDashboardModule,
    BackofficeAuthorizeModule,
    BackofficeUsersModule,
    BackofficeHistoryModule,
    BackofficeAclModule,
    BackofficeReportModule,
    BackofficeAccountBlockModule,
    BackofficeIdentifyModule,
    PspModule,
    BackofficeCardModule,
    BackofficeAccountModule,
    BackofficeCheckoutSettingsModule,
    CashoutBackofficeModule,
    BackofficeInvoiceModule,
    BackofficePoolModule,
    BackofficeCampaignModule,
    BackofficeMipgModule,
    BackofficeLeasingRefModule,
    BackofficeLeasingApplyModule,
    BackofficeLeasingInstallmentsModule,
    BackofficeGiftcardModule,
    BackofficePosManagementModule,
    BackofficeMerchantPspModule,
    MerchantModule,
    BackOfficeAppVersionModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class BackofficeModule {}
