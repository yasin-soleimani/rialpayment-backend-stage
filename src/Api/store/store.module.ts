import { Module } from '@vision/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { CardcounterService } from '../../Core/useraccount/cardcounter/cardcounter.service';
import { GeneralService } from '../../Core/service/general.service';
import { CardcounterProviders } from '../../Core/useraccount/cardcounter/cardcounter.providers';
import { DatabaseModule } from '../../Database/database.module';
import { CommentsCoreService } from '../../Core/comments/comments.service';
import { CommentsCoreProviders } from '../../Core/comments/comments.providers';
import { UserCreditCoreModule } from '../../Core/credit/usercredit/credit-core.module';
import { MerchantCreditCoreModule } from '../../Core/credit/merchantcredit/merchantcredit.module';
import { MerchantcoreModule } from '../../Core/merchant/merchantcore.module';
import { UserModule } from '../../Core/useraccount/user/user.module';
import { StoreListService } from './services/store-search.service';

@Module({
  imports: [DatabaseModule, UserCreditCoreModule, MerchantCreditCoreModule, MerchantcoreModule, UserModule],
  controllers: [StoreController],
  providers: [StoreService, GeneralService, CommentsCoreService, StoreListService, ...CommentsCoreProviders],
})
export class StoreModule {}
