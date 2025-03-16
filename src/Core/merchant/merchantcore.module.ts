import { Module } from '@vision/common';
import { MerchantcoreService } from './merchantcore.service';
import { MerchantcoreProviders } from './merchantcore.providers';
import { DatabaseModule } from '../../Database/database.module';
import { GeneralService } from '../service/general.service';
import { MerchantDiscountStrategyService } from './services/merchant-strategy.service';
import { UserModule } from '../useraccount/user/user.module';
import { CardcounterModule } from '../useraccount/cardcounter/cardcounter.module';
import { MerchantCoreTerminalService } from './services/merchant-terminal.service';
import { MerchantCoreTerminalBalanceService } from './services/merchant-terminal-balance.service';
import { MerchantCoreBookmarkService } from './services/merchant-bookmark.service';
import { AccountModule } from '../useraccount/account/account.module';
import { CardModule } from '../useraccount/card/card.module';
import { AclCoreModule } from '../acl/acl.module';
import { ClubCoreModule } from '../customerclub/club.module';
import { MerchantTerminalShareServie } from './services/merchant-terminal-share.service';
import { MerchantTerminalPosInfoService } from './services/merchant-terminal-pos-info.service';
import { MerchantCoreTerminalInfoService } from './services/merchant-terminal-info.service';
import { PspCoreModule } from '../psp/psp/pspCore.module';
import { MerchantCounterCoreService } from './services/counter.service';
import { MerchantTerminalPosInfoHistoryService } from './services/merchant-terminal-pos-info-history.service';
import { CounterCoreModule } from '../counter/counter.module';
import { MerchantShareService } from './services/merchant-share.service';
import { MerchantSettlementCoreModule } from '../merchant-settlement/merchant-settlement.module';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    CounterCoreModule,
    AccountModule,
    CardModule,
    AclCoreModule,
    ClubCoreModule,
    PspCoreModule,
    MerchantSettlementCoreModule,
  ],
  controllers: [],
  providers: [
    MerchantDiscountStrategyService,
    GeneralService,
    MerchantCoreTerminalService,
    MerchantCoreTerminalBalanceService,
    MerchantCoreBookmarkService,
    MerchantcoreService,
    MerchantTerminalPosInfoService,
    MerchantTerminalShareServie,
    MerchantCoreTerminalInfoService,
    MerchantCounterCoreService,
    MerchantTerminalPosInfoHistoryService,
    MerchantShareService,
    ...MerchantcoreProviders,
  ],
  exports: [
    MerchantcoreService,
    MerchantDiscountStrategyService,
    MerchantCoreTerminalBalanceService,
    MerchantCoreTerminalService,
    MerchantCoreBookmarkService,
    MerchantTerminalPosInfoService,
    MerchantCoreTerminalInfoService,
    MerchantCounterCoreService,
    MerchantTerminalShareServie,
    MerchantTerminalPosInfoHistoryService,
    MerchantShareService,
  ],
})
export class MerchantcoreModule {}
