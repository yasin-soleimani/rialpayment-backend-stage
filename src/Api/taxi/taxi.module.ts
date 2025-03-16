import { Module } from '@vision/common';
import { CounterCoreModule } from '../../Core/counter/counter.module';
import { GeneralService } from '../../Core/service/general.service';
import { TaxiCoreModule } from '../../Core/taxi/taxi.module';
import { CardModule } from '../../Core/useraccount/card/card.module';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { TaxiContoller } from './taxi.controller';
import { TaxiService } from './taxi.service';
import { InAppPurchaseCoreModule } from '../../Core/in-app-purchase/in-app-purchase.module';
import { BasketStoreCoreModule } from '../../Core/basket/store/basket-store.module';
import { MerchantcoreModule } from '../../Core/merchant/merchantcore.module';
import { TaxiInAppPurchaseApiService } from './services/taxi-purchase.service';
import { VitrinService } from '../basket/vitrin/vitrin.service';
import { VitrinIpgTransferService } from '../basket/vitrin/services/vitrin-ipg-transfer.service';
import { BasketVitrinCallback } from '../basket/vitrin/services/callback.service';
import { BasketVitirinRedirectService } from '../basket/vitrin/services/redirect.service';
import { VitrinWageService } from '../basket/vitrin/services/wage.service';
import { BasketVitrinLisenceService } from '../basket/vitrin/services/lisence.service';
import { VitrinInAppPurchaseApiService } from '../basket/vitrin/services/purchase.service';
import { VitrinAddressApiService } from '../basket/vitrin/payment/address.service';
import { VitrinPaymentMerchantApiService } from '../basket/vitrin/payment/payment.service';
import { VitrinPaymentSettlementApiService } from '../basket/vitrin/payment/settlement.service';
import { BasketVitrinSmsNotifService } from '../basket/vitrin/services/sms-notif.service';
import { BasketCategoryModule } from '../../Core/basket/category/category.module';
import { BasketShopModule } from '../../Core/basket/shop/shop.module';
import { BasketProductModule } from '../../Core/basket/products/product.module';
import { IpgCoreModule } from '../../Core/ipg/ipgcore.module';
import { MipgModule } from '../../Core/mipg/mipg.module';
import { MipgServiceModule } from '../../Service/mipg/mipg.module';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { BasketProductsCardsCoreModule } from '../../Core/basket/cards/cards.module';
import { LoggercoreModule } from '../../Core/logger/loggercore.module';
import { ClubpPwaModule } from '../../Core/clubpwa/club-pwa.module';
import { BasketDeliveryTimeCoreModule } from '../../Core/basket/delivery-time/delivery-time.module';
import { BasketProductOptionModule } from '../../Core/basket/product-option/product-option.module';
import { TaxiSettlementService } from './services/settlements';

@Module({
  imports: [
    TaxiCoreModule,
    CounterCoreModule,
    IpgCoreModule,
    MipgModule,
    MipgServiceModule,
    AccountModule,
    UserModule,
    LoggercoreModule,
    InAppPurchaseCoreModule,
    CardModule,
    MerchantcoreModule,
    ClubpPwaModule,
  ],
  controllers: [TaxiContoller],
  providers: [TaxiService, TaxiInAppPurchaseApiService, TaxiSettlementService, GeneralService],
  exports: [TaxiService],
})
export class TaxiApiModule {}
