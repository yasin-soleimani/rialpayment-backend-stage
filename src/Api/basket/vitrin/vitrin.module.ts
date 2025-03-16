import { Module } from '@vision/common';
import { BasketCategoryModule } from '../../../Core/basket/category/category.module';
import { BasketProductModule } from '../../../Core/basket/products/product.module';
import { VitrinController } from './vitrin.controller';
import { VitrinService } from './vitrin.service';
import { GeneralService } from '../../../Core/service/general.service';
import { UserModule } from '../../../Core/useraccount/user/user.module';
import { IpgCoreModule } from '../../../Core/ipg/ipgcore.module';
import { VitrinIpgTransferService } from './services/vitrin-ipg-transfer.service';
import { BasketProductsCardsCoreModule } from '../../../Core/basket/cards/cards.module';
import { BasketStoreCoreModule } from '../../../Core/basket/store/basket-store.module';
import { BasketShopModule } from '../../../Core/basket/shop/shop.module';
import { MipgServiceModule } from '../../../Service/mipg/mipg.module';
import { BasketVitrinCallback } from './services/callback.service';
import { MipgModule } from '../../../Core/mipg/mipg.module';
import { BasketVitirinRedirectService } from './services/redirect.service';
import { BasketVitrinLisenceService } from './services/lisence.service';
import { VitrinWageService } from './services/wage.service';
import { AccountModule } from '../../../Core/useraccount/account/account.module';
import { LoggercoreModule } from '../../../Core/logger/loggercore.module';
import { InAppPurchaseCoreModule } from '../../../Core/in-app-purchase/in-app-purchase.module';
import { VitrinInAppPurchaseApiService } from './services/purchase.service';
import { VitrinAddressApiService } from './payment/address.service';
import { VitrinPaymentMerchantApiService } from './payment/payment.service';
import { CardModule } from '../../../Core/useraccount/card/card.module';
import { MerchantcoreModule } from '../../../Core/merchant/merchantcore.module';
import { VitrinPaymentSettlementApiService } from './payment/settlement.service';
import { BasketVitrinSmsNotifService } from './services/sms-notif.service';
import { ClubpPwaModule } from '../../../Core/clubpwa/club-pwa.module';
import { BasketDeliveryTimeCoreModule } from '../../../Core/basket/delivery-time/delivery-time.module';
import { BasketProductOptionModule } from '../../../Core/basket/product-option/product-option.module';
import { VitrinCashOnDeliveryApiService } from './services/cashOnDelivery.service';
import { BasketLotteryCoreModule } from '../../../Core/basket/lottery/lottery.module';

@Module({
  imports: [
    BasketCategoryModule,
    BasketShopModule,
    BasketStoreCoreModule,
    BasketProductModule,
    IpgCoreModule,
    MipgModule,
    MipgServiceModule,
    AccountModule,
    UserModule,
    BasketProductsCardsCoreModule,
    LoggercoreModule,
    InAppPurchaseCoreModule,
    CardModule,
    MerchantcoreModule,
    ClubpPwaModule,
    BasketDeliveryTimeCoreModule,
    BasketProductOptionModule,
    BasketLotteryCoreModule,
  ],
  controllers: [VitrinController],
  providers: [
    VitrinService,
    GeneralService,
    VitrinIpgTransferService,
    BasketVitrinCallback,
    BasketVitirinRedirectService,
    VitrinWageService,
    BasketVitrinLisenceService,
    VitrinAddressApiService,
    VitrinInAppPurchaseApiService,
    VitrinPaymentMerchantApiService,
    VitrinPaymentSettlementApiService,
    BasketVitrinSmsNotifService,
    VitrinCashOnDeliveryApiService,
  ],
})
export class VitrinModule {}
