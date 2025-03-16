import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { GeneralService } from '../../Core/service/general.service';
import { UserMerchantController } from './merchant.controller';
import { UserMerchantService } from './merchant.service';
import { PspCoreService } from '../../Core/psp/psp/pspCore.service';
import { PspCoreProviders } from '../../Core/psp/psp/pspCore.providers';
import { CardService } from '../../Core/useraccount/card/card.service';
import { CardProviders } from '../../Core/useraccount/card/card.providers';
import { CardcounterService } from '../../Core/useraccount/cardcounter/cardcounter.service';
import { CardcounterProviders } from '../../Core/useraccount/cardcounter/cardcounter.providers';
import { ShabacoreModule } from '../../Core/shaba/shabacore.module';
import { AccountModule } from '../../Core/useraccount/account/account.module';
import { MerchantcoreModule } from '../../Core/merchant/merchantcore.module';
import { MerchantCreditCoreModule } from '../../Core/credit/merchantcredit/merchantcredit.module';
import { MerchantCreditService } from './merchant-credit.service';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { CardModule } from '../../Core/useraccount/card/card.module';
import { AclCoreModule } from '../../Core/acl/acl.module';
import { ClubCoreModule } from '../../Core/customerclub/club.module';
import { UserMerchantTerminalService } from './services/terminal.service';
import { MerchantShareApiService } from './services/merchant-share.service';

@Module({
  imports: [
    DatabaseModule,
    ShabacoreModule,
    AccountModule,
    MerchantcoreModule,
    MerchantCreditCoreModule,
    UserModule,
    CardModule,
    AclCoreModule,
    ClubCoreModule,
  ],
  controllers: [UserMerchantController],
  providers: [
    CardService,
    CardcounterService,
    UserMerchantService,
    PspCoreService,
    GeneralService,
    UserMerchantTerminalService,
    MerchantCreditService,
    MerchantShareApiService,
    ...PspCoreProviders,
    ...CardProviders,
    ...CardcounterProviders,
  ],
  exports: [UserMerchantService],
})
export class UserMerchantModule {}
