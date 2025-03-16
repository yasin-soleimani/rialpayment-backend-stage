import { Module } from '@vision/common';
import { AuthModule } from './Api/auth/auth.module';
import { CardModule } from './Core/useraccount/card/card.module';
import { CardcounterModule } from './Core/useraccount/cardcounter/cardcounter.module';
import { MipgBOModule } from './Backoffice/mipg/mipg.module';
import { ProfileModule } from './Api/profile/profile.module';
import { CardmanagementModule } from './Api/cardmanagement/cardmanagement.module';
import { PaymentModule } from './Api/payment/payment.module';
import { PspModule } from './Backoffice/psp/psp.module';
import { MerchantModule } from './Backoffice/merchant/merchant.module';
import { ShabaModule } from './Backoffice/shaba/shaba.module';
import { HistoryModule } from './Api/history/history.module';
import { ChargeModule } from './Api/charge/charge.module';
import { IpgCoreModule } from './Core/ipg/ipgcore.module';
import { CheckoutModule } from './Api/checkout/checkout.module';
import { VersionModule } from './Api/version/version.module';
import { LoginGatewayModule } from './Core/websocketlogin/logingateway.module';
import { CategoryModule } from './Backoffice/category/category.module';
import { UserMerchantModule } from './Api/merchant/merchant.module';
import { StoreModule } from './Api/store/store.module';
import { SdkModule } from './Api/sdk/sdk.module';
import { CategorycoreModule } from './Core/category/categorycore.module';
import { ApiPermModule } from './Backoffice/apiPerm/apiPerm.module';
import { UserCardModule } from './Api/card/usercard.module';
import { DispatcherBackofficeModule } from './Backoffice/dispatcher/dispatcher-backoffice.module';
import { BackofficeUserCreditModule } from './Backoffice/credit/backoffice-usercredit.module';
import { MemberCreditModule } from './Api/credit/usercredit.module';
import { BackofficeEditModule } from './Backoffice/edit/edit.module';
import { GroupModule } from './Api/group/group.module';
import { SettingsModule } from './Backoffice/settings/settings.module';
import { ClubApiModule } from './Api/club/club.module';
import { ParkingApiModule } from './Api/parking/parking.module';
import { StrategyApiModule } from './Api/strategy/strategy.module';
import { APP_GUARD } from '@vision/core';
import { RolesGuard } from './Guard/roles.guard';
import { MemberModule } from './Api/member/member.module';
import { ReportApiModule } from './Api/report/report.module';
import { BasketCategoryApiModule } from './Api/basket/category/category.module';
import { BasketProductApiModule } from './Api/basket/product/product.module';
import { VitrinModule } from './Api/basket/vitrin/vitrin.module';
import { MessagesApiModule } from './Api/messages/messages.module';
import { IpgBackofficeModule } from './Backoffice/ipg/ipg.module';
import { BasketProductCardsApiModule } from './Api/basket/cards/cards.module';
import { DirectIpgModule } from './Backoffice/directIpg/direct-ipg.module';
import { BasketStoreApiModule } from './Api/basket/store/basket-store.module';
import { BasketApiShopModule } from './Api/basket/shop/shop.module';
import { DownloadModule } from './Api/download/download.module';
import { VoucherApiModule } from './Api/voucher/voucher.module';
import { NationalApiModule } from './Api/national/national.module';
import { MplApiModule } from './Api/mpl/mpl.module';
import { ShaparakApiModule } from './Api/shaparak/shaparak.module';
import { NationalInsuranceApiModule } from './Api/nationalInsurance/nationalInsurance.module';
import { DeveloperApiModule } from './Api/developer/developer.module';
import { IdentifyApiModule } from './Api/identify/identify.module';
import { AuthorizeApiModule } from './Api/authorize/authorize.module';
import { BillInqiuryApiModule } from './Api/bill-inquiry/bill-inquiry.module';
import { InsuranceApiModule } from './Api/insurance/insurance.module';
import { NestEmitterModule } from '@vision/event-Emitter';
import { EventEmitter } from 'events';
import { StatisticsApiModule } from './Api/statistics/statistics.module';
import { CreditorApiModule } from './Api/creditor/creditor.module';
import { PoolApiModule } from './Api/pool/pool.module';
import { InAppPurchaseApiModule } from './Api/in-app-purchase/in-app-purchase.module';
import { TaxiApiModule } from './Api/taxi/taxi.module';
import { DiscountApiModule } from './Api/discount/discount.module';
import { CampaignApiModule } from './Api/campaign/campaign.module';
import { SendToAllApiModule } from './Api/sendtoall/sendtoall.module';
import { BalanceApiModule } from './Api/balanace/terminal-balance.module';
import { GroupReportApiModule } from './Api/group-report/group-report.module';
import { LeasingRefModule } from './Api/leasing-ref/leasing-ref.module';
import { LeasingInfoApiModule } from './Api/leasing-info/leasing-info.module';
import { LeasingOptionApiModule } from './Api/leasing-option/leasing-option.module';
import { LeasingApplyApiModule } from './Api/leasing-apply/leasing-apply.module';
import { TokenModule } from './Core/useraccount/token/token.module';
import { TokenApiModule } from './Api/token/token.module';
import { MerchantPspApiModule } from './Api/merchant-psp/merchant-psp.module';
import { LeasingContractApiModule } from './Api/leasing-contract/leasing-contract.module';
import { LeasingFormApiModule } from './Api/leasing-form/leasing-form.module';
import { LeasingInstallmentsApiModule } from './Api/leasing-installments/leasing-installments.module';
import { BasketLotteryApiModule } from './Api/basket/lottery/lottery.module';
import { TicketApiModule } from './Api/ticket/ticket.module';
import { FileManagerApiModule } from './Api/file-manager/file-manager-api.module';
import { AppVersionApiModule } from './Api/appVersion/appVersionApi.module';

@Module({
  imports: [
    TokenModule,
    NestEmitterModule.forRoot(new EventEmitter()),
    CreditorApiModule,
    InsuranceApiModule,
    BillInqiuryApiModule,
    AuthModule,
    MplApiModule,
    ShaparakApiModule,
    CardModule,
    DownloadModule,
    CardcounterModule,
    MipgBOModule,
    ProfileModule,
    NationalApiModule,
    CardmanagementModule,
    CategorycoreModule,
    StatisticsApiModule,
    PaymentModule,
    PspModule,
    ShabaModule,
    HistoryModule,
    ChargeModule,
    IdentifyApiModule,
    IpgCoreModule,
    CheckoutModule,
    VersionModule,
    CategoryModule,
    LoginGatewayModule,
    UserMerchantModule,
    StoreModule,
    SdkModule,
    ApiPermModule,
    UserCardModule,
    DispatcherBackofficeModule,
    BackofficeUserCreditModule,
    MemberCreditModule,
    BackofficeEditModule,
    GroupModule,
    SettingsModule,
    ClubApiModule,
    ParkingApiModule,
    StrategyApiModule,
    BasketApiShopModule,
    MemberModule,
    BasketStoreApiModule,
    ReportApiModule,
    BasketProductApiModule,
    BasketCategoryApiModule,
    VitrinModule,
    MessagesApiModule,
    BasketProductCardsApiModule,
    VoucherApiModule,
    DirectIpgModule,
    NationalInsuranceApiModule,
    AuthorizeApiModule,
    DeveloperApiModule,
    IpgBackofficeModule,
    PoolApiModule,
    InAppPurchaseApiModule,
    TaxiApiModule,
    DiscountApiModule,
    CampaignApiModule,
    SendToAllApiModule,
    BalanceApiModule,
    GroupReportApiModule,
    LeasingRefModule,
    LeasingInfoApiModule,
    LeasingOptionApiModule,
    LeasingApplyApiModule,
    LeasingFormApiModule,
    LeasingContractApiModule,
    LeasingInstallmentsApiModule,
    TokenApiModule,
    MerchantPspApiModule,
    BasketLotteryApiModule,
    TicketApiModule,
    FileManagerApiModule,
    AppVersionApiModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class ApplicationModule {}
