import { Module } from '@vision/common';
import { DatabaseModule } from '../../Database/database.module';
import { MemberCreditControlller } from './usercerdit.controller';
import { MemberCreditService } from './usercredit.service';
import { CreditHistoryProviders } from '../../Core/credit/history/credit-history.providers';
import { CreditHistoryCoreService } from '../../Core/credit/history/credit-history.service';
import { GeneralService } from '../../Core/service/general.service';

@Module({
  imports: [DatabaseModule],
  controllers: [MemberCreditControlller],
  providers: [MemberCreditService, CreditHistoryCoreService, GeneralService, ...CreditHistoryProviders],
})
export class MemberCreditModule {}
